export interface Product {
  id: number;
  name: string;
  cost_price: number;
  selling_price: number;
  supplier_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  cost_price: number;
  selling_price: number;
  supplier_id?: number | null;
}

export interface ProductUpdate {
  name?: string | null;
  cost_price?: number | null;
  selling_price?: number | null;
  supplier_id?: number | null;
  is_active?: boolean | null;
}