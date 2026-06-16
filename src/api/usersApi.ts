import type { CreateUserDto, UpdateUserDto, User } from '../types';
import { apiFetch } from './client';

export function fetchUsers(): Promise<User[]> {
  return apiFetch<User[]>('/users');
}

export function fetchUser(id: string): Promise<User> {
  return apiFetch<User>(`/users/${encodeURIComponent(id)}`);
}

export function createUser(data: CreateUserDto): Promise<User> {
  return apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(data) }, true);
}

export function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  return apiFetch<User>(
    `/users/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(data) },
    true,
  );
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }, true);
}
