export interface School {
  id: number;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolCreate {
  name: string;
  address?: string | null;
}

export interface SchoolUpdate {
  name?: string | null;
  address?: string | null;
  is_active?: boolean | null;
}