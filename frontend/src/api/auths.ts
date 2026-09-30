import type { LoginRequest, LoginResponse, } from "../types/auth"; 
const API_URL = import.meta.env.VITE_API_BASE_URL; 

export async function login( credentials: LoginRequest ): Promise<LoginResponse> 
{ const response = await fetch( `${API_URL}/api/auth/login`, 
    { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify(credentials), } ); 
const data = await response.json(); 
    if (!response.ok) 
        { throw new Error( data.detail || "Login failed" ); } 
    return data; }