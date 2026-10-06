import {
  Activity,
  BellRing,
  CalendarDays,
  ClipboardPlus,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings2,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['MEDECIN', 'INFIRMIER', 'ADMIN', 'PATIENT'] },
  { to: '/app/patients', label: 'Patients', icon: Users, roles: ['MEDECIN', 'INFIRMIER', 'ADMIN'] },
  { to: '/app/diagnostics', label: 'Diagnostics', icon: ClipboardPlus, roles: ['MEDECIN', 'ADMIN'] },
  { to: '/app/constantes', label: 'Suivi médical', icon: Activity, roles: ['MEDECIN', 'INFIRMIER', 'ADMIN', 'PATIENT'] },
  { to: '/app/traitements', label: 'Traitements', icon: Pill, roles: ['MEDECIN', 'ADMIN', 'PATIENT'] },
  { to: '/app/rendezvous', label: 'Rendez-vous', icon: CalendarDays, roles: ['MEDECIN', 'INFIRMIER', 'ADMIN', 'PATIENT'] },
  { to: '/app/alertes', label: 'Alertes', icon: BellRing, roles: ['MEDECIN', 'INFIRMIER', 'ADMIN', 'PATIENT'] },
  { to: '/app/utilisateurs', label: 'Utilisateurs', icon: Users, roles: ['ADMIN'] },
  { to: '/app/profil', label: 'Profil & paramètres', icon: Settings2, roles: ['MEDECIN', 'INFIRMIER', 'ADMIN', 'PATIENT'] },
];

export default function ProtectedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = navigation.find((item) => item.to === location.pathname)
    || navigation.find((item) => item.to !== '/app' && location.pathname.startsWith(`${item.to}/`));
  const userName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.name || 'Professionnel';
  const initials = userName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const role = String(user?.role || '').toUpperCase();
  const roleNavigation = navigation.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <div className="brand-avatar"><HeartPulse size={22} strokeWidth={2.4} /></div>
          <div>
            <p className="brand-title">MediTrack</p>
            <p className="brand-tag">Espace professionnel</p>
          </div>
        </div>

        <p className="sidebar-caption">Navigation hospitalière</p>
        <nav className="sidebar-nav">
          {roleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <item.icon size={17} strokeWidth={1.9} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="service-note">
            <HeartPulse size={17} aria-hidden="true" />
            <div>
              <strong>Pôle HTA & diabète</strong>
              <span>Hôpital Général de Loandjili</span>
            </div>
          </div>
          <div className="user-summary">
            <span className="user-badge">{initials}</span>
            <div>
              <p className="sidebar-user-name">{userName}</p>
              <p className="sidebar-user-role">{user?.role || 'Compte sécurisé'}</p>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div className="header-context">
            <div>
              <p className="page-subtitle">Hôpital Général de Loandjili</p>
              <h1>{currentPage?.label || 'MediTrack'}</h1>
            </div>
            <div className="header-date">
              <span className="header-status-dot" />
              <span>Suivi clinique</span>
              <time>{new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())}</time>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
