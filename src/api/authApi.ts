import { apiFetch } from './client';

export interface AuthResponse {
  access_token: string;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
