'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, Textarea, TextInput, NumberInput, Checkbox, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications, notifications } from '@mantine/notifications';
import { Trash2, Plus, Pencil } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1457/api/v1';

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window === 'undefined') {
    return headers;
  }

  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) {
      return headers;
    }
    const authData = JSON.parse(raw);
    const token = authData?.state?.token ?? authData?.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }

  return headers;
};

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
  name: '',
  description: '',
  price: '',
  category: '',
  stock: 0,
  imageUrl: '',
  isActive: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [dialogOpened, dialogHandlers] = useDisclosure(false);
  const [alertOpened, alertHandlers] = useDisclosure(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as Product[] | { products: Product[]; total: number } | { value: Product[] };
      setProducts(Array.isArray(data) ? data : (data as any).products || (data as any).value || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data products',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    dialogHandlers.open();
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    });
    dialogHandlers.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${API_BASE}/products/${editing.id}`
        : `${API_BASE}/products`;
      const method = editing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          stock: Number(form.stock),
          price: Number(form.price),
        }),
      });

      if (!res.ok) throw new Error('Failed to save product');

      notifications.show({
        title: 'Success',
        message: editing ? 'Product berhasil diperbarui' : 'Product berhasil dibuat',
        color: 'green',
      });
      dialogHandlers.close();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan product',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/products/${deleteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete product');
      notifications.show({
        title: 'Success',
        message: 'Product berhasil dihapus',
        color: 'green',
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus product',
        color: 'red',
      });
    } finally {
      setDeleteId(null);
      alertHandlers.close();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data product marketing Anda
          </p>
        </div>
        <Modal
          opened={dialogOpened}
          onClose={dialogHandlers.close}
          title={editing ? 'Edit Product' : 'Create Product'}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <TextInput
                label="Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Price"
                  required
                  decimalScale={2}
                  value={form.price}
                  onChange={(val) => setForm({ ...form, price: String(val || '') })}
                />
                <NumberInput
                  label="Stock"
                  required
                  value={form.stock}
                  onChange={(val) => setForm({ ...form, stock: Number(val || 0) })}
                />
              </div>
              <TextInput
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.currentTarget.value })}
              />
              <TextInput
                label="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.currentTarget.value })}
              />
              <Checkbox
                label="Active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.currentTarget.checked })}
              />
            </div>
            <Group justify="flex-end" mt="md">
              <Button variant="outline" type="button" onClick={dialogHandlers.close}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </Group>
          </form>
        </Modal>
        <Button
          onClick={openCreate}
          className="inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
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
                    <td className="px-6 py-4 text-gray-600">{product.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 rounded-md hover:bg-sidebar-hover transition-colors">
                          <Pencil className="w-4 h-4 text-gray-600" stroke="1.5" />
                        </button>
                        <Modal
                          opened={alertOpened && deleteId === product.id}
                          onClose={alertHandlers.close}
                          title="Delete Product"
                          size="sm"
                          centered
                        >
                          <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete this product? This action cannot be undone.
                          </p>
                          <Group justify="flex-end">
                            <Button variant="outline" onClick={alertHandlers.close}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                          </Group>
                        </Modal>
                        <button onClick={() => { setDeleteId(product.id); alertHandlers.open(); }} className="p-2 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" stroke="1.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
