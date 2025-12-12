'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useChangeStatusMutation,
} from '@/features/products/api/productsApi';
import { useProductsRealtime } from '@/features/products/hooks/useProductsRealtime';
import { Product } from '@/features/products/types';
import { DataTable } from '@/shared/components/table/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/alert-dialog';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().nonnegative('Price must be non-negative'),
  status: z.enum(['active', 'inactive']),
  category: z.string().min(1, 'Category is required').optional(),
  stock: z.coerce.number().int().nonnegative('Stock must be non-negative').optional(),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

const defaultFormValues: CreateProductFormValues = {
  name: '',
  price: 0,
  status: 'active',
  category: '',
  stock: undefined,
};

export default function ProductsPage() {
  const { data, isLoading, isError } = useGetProductsQuery();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeStatusMutation();

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: defaultFormValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form;

  const products = data?.data ?? [];
  const { products: realtimeProducts } = useProductsRealtime(products);

  const tableData = realtimeProducts?.length > 0 ? realtimeProducts : products;

  const columns: ColumnDef<Product>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: ({ row }) => row.original.category || '—',
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      cell: ({ row }) =>
        typeof row.original.stock === 'number' ? row.original.stock : '—',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span
          className={
            row.original.status === 'active'
              ? 'inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400'
              : 'inline-flex rounded-full bg-slate-500/15 px-2 py-0.5 text-xs font-medium text-slate-300'
          }
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => {
        const value = row.original.createdAt;
        const date = value ? new Date(value) : null;
        return date && !isNaN(date.getTime())
          ? date.toLocaleDateString()
          : '—';
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;
        const nextStatus =
          product.status === 'active' ? 'inactive' : 'active';

        const handleEdit = () => {
          setEditingProduct(product);
          setServerError(null);
          reset({
            name: product.name,
            price: product.price,
            status: product.status,
            category: product.category ?? '',
            stock: product.stock ?? undefined,
          });
          setValue('status', product.status, { shouldDirty: false });
          setIsAddOpen(false);
          setIsEditOpen(true);
        };

        const handleToggleStatus = async () => {
          try {
            await changeStatus({ id: product.id, status: nextStatus }).unwrap();
          } catch (err) {
            // In a real app you might show a toast; for now we just log.
            console.error('Failed to change status', err);
          }
        };

        const handleDelete = async () => {
          try {
            await deleteProduct(product.id).unwrap();
          } catch (err) {
            console.error('Failed to delete product', err);
          }
        };

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary-dark"
              disabled={isChangingStatus || isDeleting || isUpdating}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-dark"
              disabled={isChangingStatus || isDeleting}
              onClick={handleToggleStatus}
            >
              {product.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isChangingStatus || isDeleting}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-950 text-slate-100 border border-slate-800">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete product</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{' '}
                    <span className="font-semibold">{product.name}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 text-slate-100 hover:bg-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-500"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const onSubmit: SubmitHandler<CreateProductFormValues> = async (values) => {
    setServerError(null);
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, body: values }).unwrap();

        setIsEditOpen(false);
        setEditingProduct(null);
      } else {
        await createProduct(values).unwrap();
        setIsAddOpen(false);
      }

      reset(defaultFormValues);
      setValue('status', 'active', { shouldDirty: false });
    } catch (err: any) {
      const message =
        err?.data?.message || 'Failed to create product. Please try again.';
      setServerError(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Products
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your product catalog in real time.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline-dark"
          className="bg-slate-900 text-slate-100 hover:bg-slate-800"
          onClick={() => {
            setServerError(null);
            setEditingProduct(null);
            reset(defaultFormValues);
            setValue('status', 'active', { shouldDirty: false });
            setIsAddOpen(true);
          }}
        >
          Add product
        </Button>
        <p className="text-xs text-slate-500">
          Backend: Firestore via secure API.
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Failed to load products.
        </div>
      ) : (
        <DataTable<Product>
          columns={columns}
          data={tableData}
          isLoading={isLoading}
        />
      )}

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            reset(defaultFormValues);
            setValue('status', 'active', { shouldDirty: false });
            setServerError(null);
          }
        }}
      >
        <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800">
          <DialogHeader>
            <DialogTitle>Add product</DialogTitle>
          </DialogHeader>
          {serverError && (
            <div className="mb-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input type="hidden" {...register('status')} />

            <div className="space-y-1">
              <Label
                htmlFor="name"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Product name"
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                {...register('name')}
              />
              {errors.name && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.name.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="price"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                {...register('price')}
              />
              {errors.price && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.price.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="category"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Category
              </Label>
              <Input
                id="category"
                type="text"
                placeholder="Category (optional)"
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                {...register('category')}
              />
              {errors.category && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.category.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="stock"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                {...register('stock')}
              />
              {errors.stock && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.stock.message}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline-dark"
                onClick={() => {
                  setIsAddOpen(false);
                  reset(defaultFormValues);
                  setValue('status', 'active', { shouldDirty: false });
                  setServerError(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            reset(defaultFormValues);
            setValue('status', 'active', { shouldDirty: false });
            setServerError(null);
          }
        }}
      >
        <DialogContent className="bg-slate-950 text-slate-100 border border-slate-800">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          {serverError && (
            <div className="mb-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input type="hidden" {...register('status')} />

            <div className="space-y-1">
              <Label
                htmlFor="name"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                className="bg-slate-900 border-slate-800 text-slate-100 p-2"
                {...register('name')}
              />
              {errors.name && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.name.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="price"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Price
              </Label>
              <Input
                id="price"
                type="number"
                className="bg-slate-900 border-slate-800 text-slate-100 p-2"
                {...register('price')}
              />
              {errors.price && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.price.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="category"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Category
              </Label>
              <Input
                id="category"
                type="text"
                className="bg-slate-900 border-slate-800 text-slate-100 p-2"
                {...register('category')}
              />
              {errors.category && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.category.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="stock"
                className="text-xs uppercase tracking-wide text-slate-300"
              >
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                className="bg-slate-900 border-slate-800 text-slate-100 p-2"
                {...register('stock')}
              />
              {errors.stock && (
                <div className="mt-1 text-xs text-red-300">
                  {errors.stock.message}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline-dark"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingProduct(null);
                  reset();
                  setServerError(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}