import { useEffect, useState } from 'react';
import { createUser, deleteUser, fetchUsers, updateUser } from '../api/usersApi';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { CreateUserDto, UpdateUserDto, User, UserRole } from '../types';
import './AdminView.css';

type FormMode = { type: 'create' } | { type: 'edit'; user: User };

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: UserFormState = { name: '', email: '', password: '', role: 'user' };

export default function AdminView() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [formState, setFormState] = useState<UserFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setLoadError(null);
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormMode({ type: 'create' });
    setFormState(EMPTY_FORM);
    setFormError(null);
  }

  function openEdit(user: User) {
    setFormMode({ type: 'edit', user });
    setFormState({ name: user.name, email: user.email, password: '', role: user.role });
    setFormError(null);
  }

  function closeForm() {
    setFormMode(null);
    setFormError(null);
  }

  function handleFieldChange(field: keyof UserFormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (formMode?.type === 'create') {
        const dto: CreateUserDto = {
          name: formState.name,
          email: formState.email,
          password: formState.password,
          role: formState.role,
        };
        const created = await createUser(dto);
        setUsers((prev) => [...prev, created]);
        closeForm();
      } else if (formMode?.type === 'edit') {
        const dto: UpdateUserDto = {
          name: formState.name,
          email: formState.email,
          role: formState.role,
        };
        const updated = await updateUser(formMode.user.id, dto);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        closeForm();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setFormError(err instanceof ApiError ? err.message : 'Ocurrio un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta accion no se puede deshacer.`)) return;
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (formMode?.type === 'edit' && formMode.user.id === user.id) closeForm();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      alert(err instanceof ApiError ? err.message : 'No se pudo eliminar el usuario.');
    } finally {
      setDeletingId(null);
    }
  }

  const isEditing = formMode?.type === 'edit';

  return (
    <div className="admin">
      <div className="admin__header">
        <h2>Gestion de usuarios</h2>
        {formMode === null && (
          <button type="button" onClick={openCreate}>
            + Nuevo usuario
          </button>
        )}
      </div>

      {formMode !== null && (
        <div className="admin__form-panel">
          <h3 className="admin__form-title">
            {isEditing ? 'Editar usuario' : 'Crear usuario'}
          </h3>

          <form className="admin__form" onSubmit={handleSubmit} noValidate>
            <div className="admin__form-grid">
              <div className="form-field">
                <label htmlFor="af-name">Nombre</label>
                <input
                  id="af-name"
                  type="text"
                  value={formState.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  minLength={2}
                  required
                  disabled={submitting}
                  placeholder="Juan Perez"
                />
              </div>

              <div className="form-field">
                <label htmlFor="af-email">Correo electronico</label>
                <input
                  id="af-email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="juan@ejemplo.com"
                />
              </div>

              {!isEditing && (
                <div className="form-field">
                  <label htmlFor="af-password">Contrasena</label>
                  <input
                    id="af-password"
                    type="password"
                    value={formState.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    minLength={6}
                    required
                    disabled={submitting}
                    placeholder="Min. 6 caracteres"
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="af-role">Rol</label>
                <select
                  id="af-role"
                  value={formState.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  disabled={submitting}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            {formError && (
              <p className="admin__form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="admin__form-actions">
              <button type="submit" disabled={submitting}>
                {submitting
                  ? isEditing
                    ? 'Guardando...'
                    : 'Creando...'
                  : isEditing
                    ? 'Guardar cambios'
                    : 'Crear usuario'}
              </button>
              <button
                type="button"
                className="admin__btn-cancel"
                onClick={closeForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="status-message">Cargando usuarios...</p>}

      {loadError && (
        <div className="form-error" role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={loadUsers}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && users.length === 0 && (
        <p className="empty-state">No hay usuarios registrados.</p>
      )}

      {!loading && !loadError && users.length > 0 && (
        <div className="admin__table-wrapper">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo electronico</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Nombre">{user.name}</td>
                  <td data-label="Correo">{user.email}</td>
                  <td data-label="Rol">
                    <span className={`admin__role-badge admin__role-badge--${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Acciones" className="admin__actions-cell">
                    <button
                      type="button"
                      className="admin__btn-edit"
                      onClick={() => openEdit(user)}
                      disabled={deletingId === user.id}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="admin__btn-delete"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
