import type { School, SchoolCreate } from "../types/school";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function getSchools(): Promise<School[]> {
  const response = await fetch(`${API_URL}/api/schools/`);

  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }

  return response.json();
}

export async function createSchool(
  school: SchoolCreate
): Promise<School> {
  const response = await fetch(`${API_URL}/api/schools/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(school),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to create school"
    );
  }

  return response.json();
}