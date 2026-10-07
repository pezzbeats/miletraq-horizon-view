import { supabase } from '@/integrations/supabase/client';

export type ManagedUserRole = 'admin' | 'manager' | 'fuel_manager' | 'viewer';

type ManageUsersPayload =
  | {
      action: 'create';
      email: string;
      password: string;
      full_name: string;
      role: ManagedUserRole;
      phone?: string | null;
      is_active?: boolean;
    }
  | {
      action: 'update';
      user_id: string;
      email?: string;
      full_name?: string;
      role?: ManagedUserRole;
      phone?: string | null;
      is_active?: boolean;
    }
  | {
      action: 'change_password';
      user_id: string;
      password: string;
    }
  | {
      action: 'delete';
      user_id: string;
    };

export async function manageUser(payload: ManageUsersPayload) {
  const { data, error } = await supabase.functions.invoke('manage-users', {
    body: payload,
  });

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
