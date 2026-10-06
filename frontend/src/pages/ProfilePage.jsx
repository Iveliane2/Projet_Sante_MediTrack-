import { useState } from 'react';
import { Languages, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [language, setLanguage] = useState(user?.langue_preferee || 'FRANCAIS');
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const name = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Utilisateur MediTrack';

  async function changePassword(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (password !== confirmation) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    try {
      const response = await api.post('/profil/mot-de-passe', {
        current_password: currentPassword,
        password,
        password_confirmation: confirmation,
      });
      setNotice(response.data?.message || 'Mot de passe modifié.');
      setCurrentPassword('');
      setPassword('');
      setConfirmation('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Modification du mot de passe impossible.');
    }
  }

  async function saveLanguage(event) {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    setSavingLanguage(true);
    setError('');
    setNotice('');
    try {
      await api.put('/profil', { langue_preferee: nextLanguage });
      const savedUser = { ...user, langue_preferee: nextLanguage };
      localStorage.setItem('user', JSON.stringify(savedUser));
      setNotice('Préférence de langue enregistrée.');
    } catch (requestError) {
      setLanguage(user?.langue_preferee || 'FRANCAIS');
      setError(requestError.response?.data?.message || 'Enregistrement de la langue impossible.');
    } finally {
      setSavingLanguage(false);
    }
  }

  return (
    <section className="page-section profile-page">
      <header className="section-header"><div><p className="eyebrow">Compte sécurisé</p><h2>Profil et paramètres</h2><p className="small">Vos informations de compte et préférences.</p></div></header>
      {error && <p className="dashboard-error" role="alert">{error}</p>}
      {notice && <p className="constants-notice" role="status">{notice}</p>}
      <div className="profile-grid">
        <section className="clinic-panel profile-identity"><span className="profile-avatar"><UserRound size={26} /></span><h3>{name}</h3><p>{user?.email || 'Adresse non renseignée'}</p><span className="role-badge">{user?.role || 'Compte MediTrack'}</span><dl><div><dt>Téléphone</dt><dd>{user?.telephone || 'Non renseigné'}</dd></div><div><dt>Établissement</dt><dd>Hôpital Général de Loandjili</dd></div></dl></section>
        <section className="clinic-panel"><header className="panel-heading"><div><h3><Languages size={16} /> Langue</h3><p>Préférence d’affichage de votre compte</p></div></header><label className="form-field"><span className="form-label">Langue de l’interface</span><select className="form-input" value={language} onChange={saveLanguage} disabled={savingLanguage}><option value="FRANCAIS">Français</option><option value="ANGLAIS">English</option><option value="LINGALA">Lingala</option><option value="KIKONGO">Kikongo</option></select></label></section>
        <form className="clinic-panel password-form" onSubmit={changePassword}><header className="panel-heading"><div><h3><LockKeyhole size={16} /> Changer le mot de passe</h3><p>Confirmez votre mot de passe actuel avant modification.</p></div></header><label className="form-field"><span className="form-label">Mot de passe actuel</span><input className="form-input" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label className="form-field"><span className="form-label">Nouveau mot de passe</span><input className="form-input" type="password" minLength="8" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="form-field"><span className="form-label">Confirmation</span><input className="form-input" type="password" minLength="8" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><button className="btn btn-primary" type="submit">Mettre à jour le mot de passe</button></form>
      </div>
    </section>
  );
}