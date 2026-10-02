export interface Product {
  id: number;
  name: string;
  cost_price: number;
  selling_price: number;
}

export interface ProductCreate {
  name: string;
  cost_price: number;
  selling_price: number;
}