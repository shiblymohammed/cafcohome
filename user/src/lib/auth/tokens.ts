/**
 * Token Management Utilities
 *
 * Handles JWT token storage and retrieval using httpOnly cookies
 */

"use server";

import { cookies } from "next/headers";

const TOKEN_COOKIE_NAME = "auth_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Sets the authentication token in an httpOnly cookie
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

/**
 * Gets the authentication token from httpOnly cookie
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME);

  return token?.value || null;
}

/**
 * Removes the authentication token cookie
 */
export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(TOKEN_COOKIE_NAME);
}

/**
 * Checks if user has a valid token
 */
export async function hasAuthToken(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
