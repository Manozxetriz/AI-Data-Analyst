import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { DataTable, type ColumnDef } from "../components/DataTable.tsx";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

import type {
  Product,
  ProductCreate,
  ProductUpdate,
} from "../types/product";

interface ProductsProps {
  searchQuery?: string;
}

export const Products: React.FC<ProductsProps> = ({
  searchQuery = "",
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [formData, setFormData] = useState<ProductCreate>({
    name: "",
    cost_price: 0,
    selling_price: 0,
    supplier_id: null,
  });

  // GET PRODUCTS
  async function loadProducts() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // ADD PRODUCT
  const handleAddClick = () => {
    setEditingProduct(null);

    setFormData({
      name: "",
      cost_price: 0,
      selling_price: 0,
      supplier_id: null,
    });

    setIsModalOpen(true);
  };

  // EDIT PRODUCT
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      cost_price: Number(product.cost_price),
      selling_price: Number(product.selling_price),
      supplier_id: product.supplier_id,
    });

    setIsModalOpen(true);
  };

  // CREATE / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);

      if (editingProduct) {
        const updateData: ProductUpdate = {
          name: formData.name,
          cost_price: formData.cost_price,
          selling_price: formData.selling_price,
          supplier_id: formData.supplier_id,
          is_active: editingProduct.is_active,
        };

        const updatedProduct = await updateProduct(
          editingProduct.id,
          updateData
        );

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        );
      } else {
        const newProduct = await createProduct(formData);

        setProducts((currentProducts) => [
          newProduct,
          ...currentProducts,
        ]);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product"
      );
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteProduct(id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product"
      );
    }
  };

  // TABLE COLUMNS
  const columns: ColumnDef<Product>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      accessor: (product) => (
        <span className="font-mono text-slate-900">
          {product.id}
        </span>
      ),
    },

    {
      key: "name",
      header: "Product Name",
      sortable: true,
      accessor: (product) => (
        <span className="font-medium text-slate-900">
          {product.name}
        </span>
      ),
    },

    {
      key: "supplier_id",
      header: "Supplier ID",
      sortable: true,
      accessor: (product) => (
        <span className="font-mono text-slate-700">
          {product.supplier_id ?? "—"}
        </span>
      ),
    },

    {
      key: "cost_price",
      header: "Cost Price",
      sortable: true,
      align: "right",
      accessor: (product) => (
        <span className="font-mono text-slate-700">
          {Number(product.cost_price).toFixed(2)}
        </span>
      ),
    },

    {
      key: "selling_price",
      header: "Selling Price",
      sortable: true,
      align: "right",
      accessor: (product) => (
        <span className="font-mono font-medium text-slate-900">
          {Number(product.selling_price).toFixed(2)}
        </span>
      ),
    },

    {
      key: "is_active",
      header: "Status",
      sortable: true,
      accessor: (product) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            product.is_active
              ? "bg-green-50 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {product.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "created_at",
      header: "Created",
      sortable: true,
      accessor: (product) => (
        <span className="text-xs text-slate-600">
          {new Date(
            product.created_at
          ).toLocaleDateString()}
        </span>
      ),
    },

    {
      key: "actions",
      header: "Actions",
      align: "right",
      accessor: (product) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleEditClick(product)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            onClick={() => handleDelete(product.id)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  // SEARCH
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();

    return (
      product.name.toLowerCase().includes(query) ||
      product.id.toString().includes(query) ||
      product.supplier_id?.toString().includes(query)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Product Catalog
          </h1>

          <p className="text-xs text-slate-500">
            Manage products, pricing, suppliers, and product status.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Total Products */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Products
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {products.length}
              </p>
            </div>

            <Package className="h-5 w-5 text-slate-500" />
          </div>
        </div>

        {/* Active Products */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Active Products
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {
                products.filter(
                  (product) => product.is_active
                ).length
              }
            </p>
          </div>
        </div>

        {/* Inactive Products */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Inactive Products
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {
                products.filter(
                  (product) => !product.is_active
                ).length
              }
            </p>
          </div>
        </div>

      </div>

      {/* Products Table */}
      <DataTable
        title="Products"
        subtitle={`Showing ${filteredProducts.length} products`}
        data={filteredProducts}
        columns={columns}
        keyExtractor={(product) => product.id.toString()}
        pageSize={10}
        isLoading={isLoading}
        emptyMessage="No products found."
        externalSearchQuery={searchQuery}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">

            <h3 className="text-base font-semibold text-slate-900">
              {editingProduct
                ? "Edit Product"
                : "Add New Product"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {editingProduct
                ? "Update the product information"
                : "Create a new product"}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-4"
            >

              {/* Product Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Product Name
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
                  placeholder="Product name"
                />
              </div>

              {/* Supplier ID */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Supplier ID
                </label>

                <input
                  type="number"
                  min="1"
                  value={formData.supplier_id ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplier_id:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
                  placeholder="Optional supplier ID"
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">

                {/* Cost Price */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Cost Price
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost_price: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selling_price: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>

              </div>

              {/* Status */}
              {editingProduct && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Status
                  </label>

                  <select
                    value={
                      editingProduct.is_active
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_active:
                          e.target.value === "active",
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};