import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Role = "admin" | "manager" | "fuel_manager" | "viewer";

type Payload =
  | { action: "create"; email: string; password: string; full_name: string; role: Role; phone?: string | null; is_active?: boolean }
  | { action: "update"; user_id: string; email?: string; full_name?: string; role?: Role; phone?: string | null; is_active?: boolean }
  | { action: "change_password"; user_id: string; password: string }
  | { action: "delete"; user_id: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server configuration is incomplete" }, 500);
  }

  const authorization = req.headers.get("Authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return json({ error: "Authentication required" }, 401);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await admin.auth.getUser(token);

  if (callerError || !caller) {
    return json({ error: "Invalid session" }, 401);
  }

  const { data: callerProfile, error: profileError } = await admin
    .from("profiles")
    .select("id, role, is_super_admin, is_active")
    .eq("user_id", caller.id)
    .maybeSingle();

  if (profileError || !callerProfile || !callerProfile.is_active) {
    return json({ error: "Active MileTraq profile required" }, 403);
  }

  const callerIsSuperAdmin = callerProfile.is_super_admin === true;
  const callerIsAdmin = callerProfile.role === "admin";

  if (!callerIsSuperAdmin && !callerIsAdmin) {
    return json({ error: "Administrator access required" }, 403);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  const getTargetProfile = async (userId: string) => {
    const { data, error } = await admin
      .from("profiles")
      .select("id, user_id, role, is_super_admin, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const assertCanManageTarget = async (userId: string) => {
    if (userId === caller.id) {
      throw new Error("You cannot perform this action on your own account here");
    }

    const target = await getTargetProfile(userId);

    if (!target) {
      throw new Error("Target user profile not found");
    }

    if (!callerIsSuperAdmin && (target.is_super_admin || target.role === "admin")) {
      throw new Error("Only a super admin can manage another administrator");
    }

    return target;
  };

  try {
    switch (payload.action) {
      case "create": {
        const email = payload.email?.trim().toLowerCase();
        const fullName = payload.full_name?.trim();

        if (!email || !fullName || !payload.password || payload.password.length < 8) {
          return json({ error: "Valid email, full name and an 8+ character password are required" }, 400);
        }

        if (!callerIsSuperAdmin && payload.role === "admin") {
          return json({ error: "Only a super admin can create another administrator" }, 403);
        }

        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email,
          password: payload.password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

        if (createError || !created.user) {
          return json({ error: createError?.message || "Unable to create user" }, 400);
        }

        const { error: updateProfileError } = await admin
          .from("profiles")
          .update({
            full_name: fullName,
            email,
            role: payload.role,
            phone: payload.phone || null,
            is_active: payload.is_active ?? true,
          })
          .eq("user_id", created.user.id);

        if (updateProfileError) {
          await admin.auth.admin.deleteUser(created.user.id);
          return json({ error: "User creation was rolled back because the MileTraq profile could not be created" }, 500);
        }

        return json({ user_id: created.user.id }, 201);
      }

      case "update": {
        if (!payload.user_id) return json({ error: "user_id is required" }, 400);
        const target = await assertCanManageTarget(payload.user_id);

        if (!callerIsSuperAdmin && payload.role === "admin") {
          return json({ error: "Only a super admin can promote a user to administrator" }, 403);
        }

        const profilePatch: Record<string, unknown> = {};
        if (payload.full_name !== undefined) profilePatch.full_name = payload.full_name.trim();
        if (payload.email !== undefined) profilePatch.email = payload.email.trim().toLowerCase();
        if (payload.role !== undefined) profilePatch.role = payload.role;
        if (payload.phone !== undefined) profilePatch.phone = payload.phone || null;
        if (payload.is_active !== undefined) profilePatch.is_active = payload.is_active;

        if (Object.keys(profilePatch).length > 0) {
          const { error } = await admin.from("profiles").update(profilePatch).eq("user_id", target.user_id);
          if (error) return json({ error: error.message }, 400);
        }

        const authPatch: Record<string, unknown> = {};
        if (payload.email !== undefined) {
          authPatch.email = payload.email.trim().toLowerCase();
          authPatch.email_confirm = true;
        }
        if (payload.full_name !== undefined) {
          authPatch.user_metadata = { full_name: payload.full_name.trim() };
        }

        if (Object.keys(authPatch).length > 0) {
          const { error } = await admin.auth.admin.updateUserById(target.user_id, authPatch);
          if (error) return json({ error: error.message }, 400);
        }

        return json({ ok: true });
      }

      case "change_password": {
        if (!payload.user_id || !payload.password || payload.password.length < 8) {
          return json({ error: "user_id and an 8+ character password are required" }, 400);
        }

        await assertCanManageTarget(payload.user_id);
        const { error } = await admin.auth.admin.updateUserById(payload.user_id, {
          password: payload.password,
        });

        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      case "delete": {
        if (!payload.user_id) return json({ error: "user_id is required" }, 400);
        await assertCanManageTarget(payload.user_id);

        const { error } = await admin.auth.admin.deleteUser(payload.user_id);
        if (error) return json({ error: error.message }, 400);

        return json({ ok: true });
      }

      default:
        return json({ error: "Unsupported action" }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ error: message }, 400);
  }
});
