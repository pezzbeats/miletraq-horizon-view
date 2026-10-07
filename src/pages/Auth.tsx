import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Fuel,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const featureHighlights = [
  { icon: Truck, label: 'Fleet operations', tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300' },
  { icon: Fuel, label: 'Fuel intelligence', tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300' },
  { icon: Wrench, label: 'Maintenance control', tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300' },
  { icon: BarChart3, label: 'Business analytics', tone: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-300' },
];

export default function Auth() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back',
        description: 'Your MileTraq workspace is ready.',
      });
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-28 -top-28 h-[28rem] w-[28rem] rounded-full bg-indigo-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-12 h-[26rem] w-[26rem] rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-300/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden min-h-screen flex-col justify-between px-10 py-10 lg:flex xl:px-16 xl:py-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">MileTraq</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Fleet Intelligence
              </p>
            </div>
          </div>

          <div className="max-w-2xl py-14">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              One operational view for your fleet
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.03] tracking-[-0.04em] text-foreground xl:text-6xl">
              Know what your fleet is doing before it becomes a problem.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Vehicles, drivers, fuel, maintenance, documents, budgets and operating signals,
              brought together in one disciplined workspace.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
              {featureHighlights.map(({ icon: Icon, label, tone }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-sm backdrop-blur"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Role-based access. Subsidiary-aware data controls.
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:border-l lg:border-border/60 lg:bg-card/45 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">MileTraq</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Fleet Intelligence
                </p>
              </div>
            </div>

            <Card className="border-border/70 bg-card/92 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-7">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Sign in to MileTraq</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use your authorized organization account to continue.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email address</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      required
                      className="h-11 bg-background/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        required
                        className="h-11 bg-background/80 pr-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/15 hover:bg-indigo-700"
                    disabled={loading}
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/65 p-3 text-xs leading-5 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    MileTraq is a private workspace. New accounts are provisioned by an authorized administrator.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
