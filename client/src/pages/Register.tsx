import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import useUserStore, { User } from "@/store/useUserStore";
import { useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";

async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

type FormValues = {
  name: string;
  email: string;
  password?: string;
};

export default function Register() {
  const { register, handleSubmit } = useForm<FormValues>();
  const { toast } = useToast();
  const setUser = useUserStore((s) => s.setUser);
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: FormValues) => {
    if (!data.password || data.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    registerApi({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
    })
      .then((user: User) => {
        setUser(user);
        toast({ title: "Registered", description: `Welcome, ${user.name}` });
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
        <h1 className="text-3xl font-display font-bold mb-6">Create account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            <Input {...register("name", { required: true })} className="mt-1" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input
              {...register("email", { required: true })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <Input type="password" {...register("password")} className="mt-1" />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
