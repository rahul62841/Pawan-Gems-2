import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import useUserStore, { User } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import apiFetch from "@/lib/api";

type FormValues = {
  name: string;
  email: string;
  password?: string;
};

export default function Profile() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const logout = useUserStore((s) => s.logout);
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderRequests, setOrderRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await apiFetch("/api/order-requests", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setOrderRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/me", {
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

        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            onClick={async () => {
              try {
                const res = await apiFetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                if (res.ok) {
                  logout();
                  toast({ title: "Logged out" });
                  window.location.href = "/";
                } else {
                  toast({ title: "Error", description: "Logout failed" });
                }
              } catch (err) {
                console.error(err);
                toast({ title: "Error", description: "Logout failed" });
              }
            }}
          >
            Logout
          </Button>
        </div>

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

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Your Order Requests</h2>
          {orderRequests.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              You have no requests.
            </div>
          ) : (
            <div className="space-y-3">
              {orderRequests.map((r) => (
                <div key={r.id} className="p-3 border rounded">
                  <div className="font-medium">
                    {r.product_name} x{r.quantity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.message}
                  </div>
                  <div className="text-sm">Status: {r.status}</div>
                  {r.admin_message && (
                    <div className="text-xs text-muted-foreground">
                      Admin: {r.admin_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
