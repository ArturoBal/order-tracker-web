import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginView from './views/LoginView';
import OrdersView from './views/OrdersView';
import AdminView from './views/AdminView';
import './App.css';

type View = 'orders' | 'admin';

function AuthenticatedApp() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [view, setView] = useState<View>('orders');

  // Guard: if the active view requires admin but user is not admin, fall back
  useEffect(() => {
    if (view === 'admin' && !isAdmin) setView('orders');
  }, [view, isAdmin]);

  return (
    <div className="app-shell">
      <header className="app-nav">
        <span className="app-nav__brand">Order Tracker</span>
        <nav className="app-nav__links">
          {user && (
            <span className="app-nav__user">
              {user.name}
              <span className={`app-nav__role app-nav__role--${user.role}`}>{user.role}</span>
            </span>
          )}
          <button
            type="button"
            className={`app-nav__btn${view === 'orders' ? ' app-nav__btn--active' : ''}`}
            onClick={() => setView('orders')}
          >
            Ordenes
          </button>
          {isAdmin && (
            <button
              type="button"
              className={`app-nav__btn${view === 'admin' ? ' app-nav__btn--active' : ''}`}
              onClick={() => setView('admin')}
            >
              Admin
            </button>
          )}
          <button type="button" className="app-nav__btn app-nav__btn--logout" onClick={logout}>
            Cerrar sesion
          </button>
        </nav>
      </header>

      <main className="app-content">
        {view === 'admin' && isAdmin ? <AdminView /> : <OrdersView />}
      </main>
    </div>
  );
}

export default function App() {
  const { token, userLoading } = useAuth();

  if (!token) return <LoginView />;

  if (userLoading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return <AuthenticatedApp />;
}
