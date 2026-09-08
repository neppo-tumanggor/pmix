"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { TrashIcon, PlusIcon, Pencil1Icon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import { Toast, ToastProvider, ToastViewport } from "@radix-ui/react-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4081";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: string;
  category?: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductFormData = {
  name: string;
  description?: string;
  price: string;
  category?: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
};

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: 0,
  imageUrl: "",
  isActive: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [toast, setToast] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.value || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setToast("Gagal memuat data products");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category || "",
      stock: product.stock,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${API_BASE}/api/products/${editing.id}`
        : `${API_BASE}/api/products`;
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stock: Number(form.stock),
          price: Number(form.price),
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setToast(
        editing
          ? "Product berhasil diperbarui"
          : "Product berhasil dibuat"
      );
      setOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      setToast("Gagal menyimpan product");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setToast("Product berhasil dihapus");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setToast("Gagal menghapus product");
    } finally {
      setDeleteId(null);
    }
  };
  return (
    <div className="p-6">
      <ToastProvider>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Products</h2>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data product marketing Anda
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                className="inline-flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-border rounded-lg p-6 max-w-md w-full shadow-sm">
              <div className="mb-4">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {editing ? "Edit Product" : "Create Product"}
                </DialogTitle>
              </div>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Price</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm text-foreground">Active</label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">{editing ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-sidebar">
                      <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                      <td className="px-6 py-4 text-gray-600">{product.category || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">Rp {Number(product.price).toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(product)} className="p-2 rounded-md hover:bg-sidebar-hover transition-colors">
                            <Pencil1Icon className="w-4 h-4 text-gray-600" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button onClick={() => setDeleteId(product.id)} className="p-2 rounded-md hover:bg-red-50 transition-colors">
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border border-border rounded-lg p-6 max-w-sm w-full">
                              <div>
                                <AlertDialogTitle className="text-lg font-semibold text-foreground">Delete Product</AlertDialogTitle>
                                <AlertDialogDescription className="mt-2 text-sm text-gray-600">
                                  Are you sure you want to delete this product? This action cannot be undone.
                                </AlertDialogDescription>
                              </div>
                              <div className="flex justify-end gap-2">
                                <AlertDialogCancel className="px-4 py-2 text-sm border border-border rounded-md hover:bg-sidebar transition-colors">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete</AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Toast open={!!toast} onOpenChange={(open) => !open && setToast("")}>
          <div className="bg-foreground text-background px-4 py-3 rounded-md shadow-sm text-sm">
            {toast}
          </div>
          <ToastViewport className="fixed bottom-4 right-4" />
        </Toast>
      </ToastProvider>
    </div>
  );
}
