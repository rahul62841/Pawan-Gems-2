import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import useUserStore, { User } from "@/store/useUserStore";
import { useState } from "react";

type FormValues = {
  name: string;
  email: string;
  password?: string;
};

export default function Profile() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Update failed");
      setUser(payload);
      toast({ title: "Profile updated" });
      reset({ name: payload.name, email: payload.email });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-24 px-6 lg:px-8 max-w-2xl mx-auto">
          <h2 className="text-xl">Not logged in</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6">Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            <Input
              {...register("name")}
              defaultValue={user.name}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input
              {...register("email")}
              defaultValue={user.email}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              New Password (optional)
            </label>
            <Input type="password" {...register("password")} className="mt-1" />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
