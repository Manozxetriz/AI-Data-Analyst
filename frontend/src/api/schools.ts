import type { School, SchoolCreate } from "../types/school";
import { apiFetch } from "./client";

export async function getSchools(): Promise<School[]> {
  const response = await apiFetch("/api/schools/");

  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }

  return response.json();
}

export async function createSchool(
  school: SchoolCreate
): Promise<School> {
  const response = await apiFetch("/api/schools/", {
    method: "POST",
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