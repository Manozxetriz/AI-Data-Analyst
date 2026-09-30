export interface LoginRequest 
{ email: string; password: string; } 
export interface User
{ id: number; email: string; role: string; is_active: boolean; } 
export interface LoginResponse 
{ access_token: string; token_type: string; user: User; }