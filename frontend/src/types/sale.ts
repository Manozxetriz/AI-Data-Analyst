export interface Sale {
  id: number;
  bill_no: string;
  sale_date: string;

  school_id: number | null;
  customer_id: number | null;

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  payment_status: string;

  created_at: string;
  updated_at: string;
}

export interface SaleCreate {
  bill_no: string;
  sale_date: string;

  school_id?: number | null;
  customer_id?: number | null;

  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;

  payment_status?: string;
}

export interface SaleUpdate {
  bill_no?: string | null;
  sale_date?: string | null;

  school_id?: number | null;
  customer_id?: number | null;

  subtotal?: number | null;
  discount?: number | null;
  tax?: number | null;
  total?: number | null;

  payment_status?: string | null;
}