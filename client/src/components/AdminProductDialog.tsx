import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useState, useEffect } from "react";
import { z } from "zod";

// Create a schema that coerces strings to numbers for the form
const formSchema = insertProductSchema.extend({
  price: z.coerce.number().min(1, "Price must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminProductDialogProps {
  product?: Product;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminProductDialog({ product, trigger, open: controlledOpen, onOpenChange }: AdminProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const isEditing = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
      isFeatured: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price, // Already in cents? No, likely stored in cents, displayed in dollars? 
                              // Wait, schema says stored in cents. 
                              // Form should probably take input in DOLLARS/major units for UX, but let's stick to cents for simplicity or handle conversion.
                              // Let's assume input is in CENTS for simplicity to avoid conversion bugs, 
                              // OR input is raw number and stored as is. 
                              // Re-reading schema: price: integer("price").notNull(), // stored in cents
                              // I will assume the admin enters CENTS for now to be safe and explicit.
        imageUrl: product.imageUrl,
        category: product.category,
        isFeatured: product.isFeatured || false,
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        category: "",
        isFeatured: false,
      });
    }
  }, [product, reset, open]);

  const onSubmit = (data: FormValues) => {
    if (isEditing && product) {
      updateMutation.mutate(
        { id: product.id, ...data },
        { onSuccess: () => setOpen && setOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setOpen && setOpen(false) });
    }
  };

  const handleCategoryChange = (val: string) => setValue("category", val);
  const handleFeaturedChange = (checked: boolean) => setValue("isFeatured", checked);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to your product here." : "Add a new jewelry piece to your collection."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register("name")} placeholder="Diamond Tennis Necklace" />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (in cents)</Label>
                <Input id="price" type="number" {...register("price")} placeholder="125000" />
                <p className="text-[10px] text-muted-foreground">Example: 125000 = $1,250.00</p>
                {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange} defaultValue={product?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Necklaces">Necklaces</SelectItem>
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                    <SelectItem value="Bracelets">Bracelets</SelectItem>
                    <SelectItem value="Watches">Watches</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                {...register("description")} 
                className="min-h-[100px]" 
                placeholder="Describe the cut, clarity, and materials..." 
              />
              {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
              {errors.imageUrl && <p className="text-destructive text-xs">{errors.imageUrl.message}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isFeatured" 
                checked={watch("isFeatured")}
                onCheckedChange={handleFeaturedChange}
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">Feature this product on homepage</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen && setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
