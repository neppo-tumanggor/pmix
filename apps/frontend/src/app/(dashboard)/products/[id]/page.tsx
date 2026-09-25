'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Stack, Paper, Button, Group, Text, Badge, LoadingOverlay, Divider, Alert } from '@mantine/core';
import { isAxiosError } from 'axios';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { Modal, TextInput, Textarea, NumberInput, Checkbox } from '@mantine/core';
import apiClient from '@/lib/api/auth';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
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

export default function ProductDetailPage() {
  const router = useRouter();
  const { id: productId } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [dialogOpened, dialogHandlers] = useDisclosure(false);
  const [editModalOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await apiClient.get(`/products/${encodeURIComponent(productId)}`);
      const data = response.data;
      
      let productData: Product | null = null;
      if (data && typeof data === 'object') {
        productData = data.product || data;
      }
      
      if (productData) {
        setProduct(productData);
        setForm({
          name: productData.name,
          description: productData.description || '',
          price: String(productData.price),
          category: productData.category || '',
          stock: productData.stock,
          imageUrl: productData.imageUrl || '',
          isActive: productData.isActive,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Product not found',
          color: 'red',
        });
        router.push('/products');
      }
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      setLoadError(status === 404
        ? 'Produk tidak ditemukan atau tidak tersedia untuk akun Anda.'
        : status
          ? `Detail produk gagal dimuat (HTTP ${status}). Silakan coba lagi.`
          : 'Tidak dapat terhubung ke layanan produk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    openEdit();
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };

      await apiClient.patch(`/products/${product.id}`, payload);
      
      notifications.show({
        title: 'Success',
        message: 'Product updated successfully',
        color: 'green',
      });

      closeEdit();
      fetchProduct();
    } catch (error) {
      console.error('Failed to update product:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal mengupdate product',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await apiClient.delete(`/products/${product.id}`);
      
      notifications.show({
        title: 'Success',
        message: 'Product deleted successfully',
        color: 'green',
      });

      router.push('/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus product',
        color: 'red',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container size="lg" py="lg">
        <LoadingOverlay visible={loading} />
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container size="lg" py="lg">
        <Alert color="red" title="Detail produk belum dapat ditampilkan">
          <Text size="sm">{loadError}</Text>
          <Group mt="md">
            <Button variant="default" onClick={() => router.push('/products')}>Kembali ke daftar produk</Button>
            <Button variant="light" onClick={() => void fetchProduct()}>Coba lagi</Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Container size="lg" py="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Group gap="sm">
            <Button
              variant="outline"
              leftSection={<Pencil size={16} />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              color="red"
              variant="outline"
              leftSection={<Trash2 size={16} />}
              onClick={dialogHandlers.open}
            >
              Delete
            </Button>
          </Group>
        </Group>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={700} size="xl" mb="xs">
                  {product.name}
                </Text>
                <Group gap="xs">
                  <Badge color={product.isActive ? 'green' : 'gray'} variant="light">
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {product.category && (
                    <Badge color="blue" variant="light">
                      {product.category}
                    </Badge>
                  )}
                </Group>
              </div>
            </Group>

            <Divider my="md" />

            <Stack gap="sm">
              <div>
                <Text fw={500} size="sm" c="dimmed" mb="xs">
                  Description
                </Text>
                <Text size="md">
                  {product.description || 'No description provided'}
                </Text>
              </div>

              <Group grow>
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb="xs">
                    Price
                  </Text>
                  <Text fw={600} size="lg">
                    {formatCurrency(product.price)}
                  </Text>
                </div>
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb="xs">
                    Stock
                  </Text>
                  <Text fw={600} size="lg">
                    {product.stock}
                  </Text>
                </div>
              </Group>

              {product.imageUrl && (
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb="xs">
                    Image URL
                  </Text>
                  <Text size="sm" style={{ wordBreak: 'break-all' }}>
                    {product.imageUrl}
                  </Text>
                </div>
              )}

            <Divider my="md" />

            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                Created: {formatDate(product.createdAt)}
              </Text>
              <Text size="xs" c="dimmed">
                Last Updated: {formatDate(product.updatedAt)}
              </Text>
            </Stack>
          </Stack>
          </Stack>
        </Paper>
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEdit}
        title="Edit Product"
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            minRows={3}
          />
          <Group grow>
            <NumberInput
              label="Price (Rp)"
              value={form.price}
              onChange={(value) => setForm({ ...form, price: String(value || '') })}
              min={0}
              required
            />
            <NumberInput
              label="Stock"
              value={form.stock}
              onChange={(value) => setForm({ ...form, stock: Number(value || 0) })}
              min={0}
              required
            />
          </Group>
          <TextInput
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <TextInput
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <Checkbox
            label="Active"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={dialogOpened}
        onClose={dialogHandlers.close}
        title="Delete Confirmation"
        size="sm"
        centered
      >
        <Text size="sm" c="dimmed" mb="md">
          Are you sure you want to delete "{product.name}"? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={dialogHandlers.close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
