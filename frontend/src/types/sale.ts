export interface Sale {
  id: number;
  bill_no: string;
  sale_date: string;
  school_id: number;
  product_id: number;
  sales_price: number;
}

export interface SaleCreate {
  bill_no: string;
  sale_date: string;
  school_id: number;
  product_id: number;
  sales_price: number;
}