import { useState } from 'react';
import { login } from '../api/authApi';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './LoginView.css';

export default function LoginView() {
  const { setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      setToken(access_token);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Ocurrio un error inesperado.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <h1>Order Tracker</h1>
          <p>Inicia sesion para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Correo electronico</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Contrasena</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !email || !password}>
            {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </button>
        </form>
      </div>
    </div>
  );
}
