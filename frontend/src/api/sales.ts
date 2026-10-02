import type {
  Sale,
  SaleCreate,
} from "../types/sale";
import { apiFetch } from "./client";

export async function getSales(): Promise<Sale[]> {
  const response = await apiFetch("/api/sales/");

  if (!response.ok) {
    throw new Error("Failed to fetch sales");
  }

  return response.json();
}

export async function createSale(
  sale: SaleCreate
): Promise<Sale> {
  const response = await apiFetch("/api/sales/", {
    method: "POST",
    body: JSON.stringify(sale),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to create sale"
    );
  }

  return response.json();
}

export async function updateSale(
  id: number,
  sale: SaleCreate
): Promise<Sale> {
  const response = await apiFetch(`/api/sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(sale),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to update sale"
    );
  }

  return response.json();
}

export async function deleteSale(id: number): Promise<void> {
  const response = await apiFetch(`/api/sales/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to delete sale"
    );
  }
}