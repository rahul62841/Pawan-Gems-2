import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import useUserStore, { User } from "@/store/useUserStore";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";

async function loginApi(payload: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

async function logoutApi() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<FormValues>();
  const { toast } = useToast();
  const setUser = useUserStore((s) => s.setUser);
  const logout = useUserStore((s) => s.logout);
  const user = useUserStore((s) => s.user);
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: FormValues) => {
    setLoading(true);
    loginApi({ email: data.email.trim(), password: data.password })
      .then((user: User) => {
        setUser(user);
        toast({ title: "Logged in", description: `Welcome, ${user.name}` });
        setLocation("/");
      })
      .catch((err: Error) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6">Account</h1>

        {user ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg font-semibold">{user.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-lg font-semibold">{user.email}</div>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={async () => {
                  await logoutApi();
                  logout();
                  toast({ title: "Logged out" });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                {...register("email", { required: true })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Password</label>
              <Input
                type="password"
                {...register("password", { required: true })}
                className="mt-1"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link href="/register" className="text-primary">
                Register
              </Link>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
