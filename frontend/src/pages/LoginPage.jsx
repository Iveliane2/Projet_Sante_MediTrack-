import { useState } from 'react';
import { ArrowLeft, HeartPulse, ShieldCheck, Stethoscope, UserCog, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const demoAccounts = [
  { role: 'Médecin', email: 'medecin@meditrack.local', password: 'Medecin-HGL-2026', icon: Stethoscope },
  { role: 'Infirmier', email: 'infirmier@meditrack.local', password: 'Infirmier-HGL-2026', icon: UserRound },
  { role: 'Administrateur', email: 'admin@meditrack.local', password: 'Admin-HGL-2026', icon: UserCog },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password });
      navigate('/app');
    } catch {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="login-home-link"><ArrowLeft size={16} /> Retour à l’accueil</Link>
      <div className="login-layout">
        <div className="login-intro">
          <Link to="/" className="public-brand">
            <span className="public-brand-mark"><HeartPulse size={22} /></span>
            <span><strong>MediTrack</strong><small>Hôpital Général de Loandjili</small></span>
          </Link>
          <span className="login-intro-label"><ShieldCheck size={15} /> Accès sécurisé</span>
          <h1>Votre espace de suivi clinique.</h1>
          <p>Connectez-vous avec le compte professionnel attribué à votre rôle hospitalier.</p>
        </div>
        <div className="login-card">
          <div className="login-header">
            <p className="eyebrow">Portail hospitalier</p>
            <h2>Connexion professionnelle</h2>
            <p>Utilisez votre adresse e-mail et votre mot de passe.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label className="form-label" htmlFor="login-email">Adresse e-mail</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="nom@meditrack.local" autoComplete="username" required />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="login-password">Mot de passe</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Votre mot de passe" autoComplete="current-password" required />
            </div>

            {error ? <p className="error-text" role="alert">{error}</p> : null}

            <button type="submit" className="btn btn-primary login-submit">Se connecter</button>
          </form>

          <div className="demo-access">
            <div className="demo-access-heading"><span>Comptes de démonstration</span><small>Environnement local</small></div>
            {demoAccounts.map(({ role, email: demoEmail, password: demoPassword, icon: Icon }) => (
              <button className="demo-account" type="button" key={role} onClick={() => { setEmail(demoEmail); setPassword(demoPassword); }}>
                <span className="demo-account-icon"><Icon size={16} /></span>
                <span className="demo-account-text"><strong>{role}</strong><small>{demoEmail}</small></span>
                <span className="demo-account-use">Utiliser</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
