import { Navigation } from "@/components/Navigation";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { AdminProductDialog } from "@/components/AdminProductDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${base}/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setLocation("/");
          return;
        }
        const user = await res.json();
        if (!user || !user.is_admin) {
          setLocation("/");
        }
      } catch (err) {
        console.error(err);
        setLocation("/");
      }
    })();
  }, [setLocation]);
  const { data: products, isLoading } = useProducts();
  const deleteMutation = useDeleteProduct();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [orderRequests, setOrderRequests] = useState<any[]>([]);
  const [adminMessages, setAdminMessages] = useState<Record<number, string>>(
    {}
  );

  async function fetchOrderRequests() {
    try {
      const res = await fetch("/api/admin/order-requests", {
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

  async function decideRequest(id: number, decision: "accepted" | "declined") {
    try {
      const adminMessage =
        adminMessages[id] ||
        (decision === "accepted" ? "Approved" : "Declined");
      const res = await fetch(`/api/admin/order-requests/${id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ decision, adminMessage }),
      });
      if (res.ok) {
        await fetchOrderRequests();
        toast({ title: "Updated", description: "Request updated" });
      } else {
        toast({ title: "Error", description: "Could not update request" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not update request" });
    }
  }

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />

      <div className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">
              Product Management
            </h1>
            <p className="text-muted-foreground">
              Manage your catalog, inventory, and pricing.
            </p>
          </div>

          <AdminProductDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            }
          />
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Order Requests</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={fetchOrderRequests}>
                Refresh
              </Button>
            </div>
          </div>
          <div className="space-y-3 mt-3">
            {orderRequests.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No order requests yet.
              </div>
            ) : (
              orderRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {r.product_name} x{r.quantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.user_name} — {r.message}
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-muted-foreground block mb-1">
                        Admin message
                      </label>
                      <textarea
                        value={adminMessages[r.id] || ""}
                        onChange={(e) =>
                          setAdminMessages((s) => ({
                            ...s,
                            [r.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded border p-2 text-sm"
                        rows={2}
                        placeholder="Optional message to the customer"
                      />
                    </div>
                    <div className="text-sm">Status: {r.status}</div>
                    {r.admin_message && (
                      <div className="text-xs text-muted-foreground">
                        Admin: {r.admin_message}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => decideRequest(r.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => decideRequest(r.id, "declined")}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-border bg-white flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover bg-secondary"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(product.price / 100)}
                      </TableCell>
                      <TableCell>
                        {product.isFeatured ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
                            Featured
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <AdminProductDialog
                            product={product}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-primary"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            }
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-destructive text-destructive/80"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{product.name}"
                                  from your catalog. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No products found. Add some inventory!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
