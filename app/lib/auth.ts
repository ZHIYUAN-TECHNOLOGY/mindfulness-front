import { apiFetch } from "./api";
import type { User } from "../shared";

export async function getMe(): Promise<User | null> {
  try {
    const data = await apiFetch("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function requestMagicLink(email: string): Promise<void> {
  await apiFetch("/api/auth/request-magic-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string): Promise<User> {
  const data = await apiFetch("/api/auth/verify-magic-link", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return data.user;
}

export async function register(email: string, password: string): Promise<{ success: boolean; email: string }> {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data;
}

export async function verifyOtp(email: string, otp: string): Promise<User> {
  const data = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  return data.user;
}

export async function resendOtp(email: string): Promise<void> {
  await apiFetch("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function login(email: string, password: string): Promise<User> {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<User> {
  const data = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function createCheckoutSession(): Promise<{ url: string }> {
  const data = await apiFetch("/api/stripe/create-checkout-session", { method: "POST" });
  return data;
}
