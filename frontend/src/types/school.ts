export interface School {
  id: number;
  name: string;
  address: string | null;
}

export interface SchoolCreate {
  name: string;
  address?: string | null;
}