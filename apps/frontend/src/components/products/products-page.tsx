'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, Stack, Paper, Button, Modal, TextInput, Textarea, 
  NumberInput, Checkbox, Group, Table, ActionIcon, Badge, LoadingOverlay, Text
} from '@mantine/core';
import { PageHeader } from '@/components/layout/page-header';
import { useDisclosure } from '@mantine/hooks';
import { Notifications, notifications } from '@mantine/notifications';
import { Trash2, Plus, Pencil } from 'lucide-react';
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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [dialogOpened, dialogHandlers] = useDisclosure(false);
  const [alertOpened, alertHandlers] = useDisclosure(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      const data = response.data;
      
      let productsList: Product[] = [];
      if (Array.isArray(data)) {
        productsList = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.products)) {
          productsList = data.products;
        } else if (Array.isArray(data.value)) {
          productsList = data.value;
        }
      }
      
      setProducts(productsList);
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
      price: String(product.price),
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
      const payload = {
        ...form,
        stock: Number(form.stock),
        price: Number(form.price),
      };

      if (editing) {
        await apiClient.patch('/products/', payload);
      } else {
        await apiClient.post('/products', payload);
      }

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
      await apiClient.delete(`/products/${deleteId}`);
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
    <Container size='xl' py='lg'>
      <Stack gap='md'>
        <PageHeader
          title="Products"
          description="Kelola data product marketing Anda"
          action={
            <Button onClick={openCreate} leftSection={<Plus size={16} />}>
              Add Product
            </Button>
          }
        />

        <Paper shadow='sm' p='md' radius='md' withBorder pos='relative'>
          <LoadingOverlay visible={loading} />
          
          {!loading && products.length === 0 ? (
            <Text c='dimmed' ta='center' py='xl'>
              No products found
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Stock</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th ta='right'>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {products.map((product) => (
                    <Table.Tr key={product.id}>
                      <Table.Td>
                        <Button
                          variant='subtle'
                          color='blue'
                          onClick={() => {
                            router.push(`/products/${product.id}`)
                          }}
                          styles={{ root: { padding: 0, height: 'auto', fontWeight: 500 } }}
                        >
                          {product.name}
                        </Button>
                      </Table.Td>
                      <Table.Td>{product.category || '-'}</Table.Td>
                      <Table.Td>Rp {Number(product.price).toLocaleString('id-ID')}</Table.Td>
                      <Table.Td>{product.stock}</Table.Td>
                      <Table.Td>
                        <Badge color={product.isActive ? 'green' : 'gray'} variant='light'>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap='xs' justify='flex-end'>
                          <ActionIcon
                            variant='subtle'
                            color='blue'
                            onClick={() => openEdit(product)}
                          >
                            <Pencil size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant='subtle'
                            color='red'
                            onClick={() => { setDeleteId(product.id); alertHandlers.open(); }}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Paper>
      </Stack>

      {/* Create/Edit Modal */}
      <Modal
        opened={dialogOpened}
        onClose={dialogHandlers.close}
        title={editing ? 'Edit Product' : 'Create Product'}
        size='md'
      >
        <form onSubmit={handleSubmit}>
          <Stack gap='md'>
            <TextInput
              label='Name'
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
            />
            <Textarea
              label='Description'
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
              rows={3}
            />
            <Group gap='md'>
              <NumberInput
                label='Price'
                required
                decimalScale={2}
                prefix='Rp '
                value={form.price}
                onChange={(val) => setForm({ ...form, price: String(val || '') })}
                style={{ flex: 1 }}
              />
              <NumberInput
                label='Stock'
                required
                value={form.stock}
                onChange={(val) => setForm({ ...form, stock: Number(val || 0) })}
                style={{ flex: 1 }}
              />
            </Group>
            <TextInput
              label='Category'
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.currentTarget.value })}
            />
            <TextInput
              label='Image URL'
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.currentTarget.value })}
            />
            <Checkbox
              label='Active'
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.currentTarget.checked })}
            />
          </Stack>
          <Group justify='flex-end' mt='lg'>
            <Button variant='outline' type='button' onClick={dialogHandlers.close}>Cancel</Button>
            <Button type='submit'>{editing ? 'Update' : 'Create'}</Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={alertOpened && deleteId !== null}
        onClose={alertHandlers.close}
        title='Delete Product'
        size='sm'
        centered
      >
        <Text size='sm' c='dimmed' mb='md'>
          Are you sure you want to delete this product? This action cannot be undone.
        </Text>
        <Group justify='flex-end'>
          <Button variant='outline' onClick={alertHandlers.close}>Cancel</Button>
          <Button color='red' onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
    </Container>
  );
}
