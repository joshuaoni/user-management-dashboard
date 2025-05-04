"use server";

import { cookies } from "next/headers";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  profilePhoto?: string;
}

interface UsersResponse {
  data: {
    users: User[];
  };
  totalPages: number;
  total: number;
}

export async function getUsers(
  page: number,
  search: string,
  role: string
): Promise<UsersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
  });

  if (search.trim()) {
    params.append("search", search.trim());
  }
  if (role) {
    params.append("role", role);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`,
    {
      headers: {
        Cookie: cookies().toString(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function updateUser(userId: string, formData: FormData) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    {
      method: "PATCH",
      body: formData,
      headers: {
        Cookie: cookies().toString(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
}

export async function deleteUser(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        Cookie: cookies().toString(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  // If the response is empty, return a success object
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return { success: true };
  }

  // Otherwise try to parse the response as JSON
  try {
    return response.json();
  } catch (error) {
    return { success: true };
  }
}

export async function createUser(formData: FormData) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    method: "POST",
    body: formData,
    headers: {
      Cookie: cookies().toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
}
