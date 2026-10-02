import type {
  Product,
  ProductCreate,
} from "../types/product";
import { apiFetch } from "./client";

export async function getProducts(): Promise<Product[]> {
  const response = await apiFetch("/api/products/");

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function createProduct(
  product: ProductCreate
): Promise<Product> {
  const response = await apiFetch("/api/products/", {
    method: "POST",
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to create product"
    );
  }

  return response.json();
}
export async function updateProduct(
  id: number,
  product: ProductCreate
): Promise<Product> {
  const response = await apiFetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to update product"
    );
  }

  return response.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await apiFetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to delete product"
    );
  }
}