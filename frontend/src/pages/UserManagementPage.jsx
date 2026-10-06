import { useEffect, useState } from 'react';
import { UserPlus, Users, X } from 'lucide-react';
import api from '../services/api';

const emptyForm = { prenom: '', nom: '', email: '', telephone: '', password: '', role: 'MEDECIN' };

function listFrom(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadUsers() {
    try {
      setUsers(listFrom(await api.get('/utilisateurs')));
      setError('');
    } catch {
      setError('La liste des comptes est indisponible. Vérifiez vos droits administrateur.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api.get('/utilisateurs')
      .then((response) => { if (active) setUsers(listFrom(response)); })
      .catch(() => { if (active) setError('La liste des comptes est indisponible. Vérifiez vos droits administrateur.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function createUser(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api.post('/utilisateurs', form);
      setForm(emptyForm);
      setShowForm(false);
      setNotice('Compte créé et activé.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Création impossible. Vérifiez les informations saisies.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user) {
    const nextStatus = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    try {
      await api.put(`/utilisateurs/${user.id}`, { statut: nextStatus });
      await loadUsers();
      setNotice(`Compte ${nextStatus === 'ACTIF' ? 'réactivé' : 'désactivé'}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Modification du compte impossible.');
    }
  }

  return (
    <section className="page-section">
      <header className="section-header">
        <div><p className="eyebrow">Administration système</p><h2>Gestion des utilisateurs</h2><p className="small">Comptes, rôles et accès de la plateforme MediTrack.</p></div>
        <button className="btn btn-primary" type="button" onClick={() => setShowForm((value) => !value)}>{showForm ? <X size={16} /> : <UserPlus size={16} />}{showForm ? 'Fermer' : 'Ajouter un compte'}</button>
      </header>

      {error && <p className="dashboard-error" role="alert">{error}</p>}
      {notice && <p className="constants-notice" role="status">{notice}</p>}

      {showForm && <form className="clinic-panel user-create-form" onSubmit={createUser}>
        <div className="user-form-grid">
          <label className="form-field"><span className="form-label">Prénom</span><input className="form-input" required value={form.prenom} onChange={(event) => setForm({ ...form, prenom: event.target.value })} /></label>
          <label className="form-field"><span className="form-label">Nom</span><input className="form-input" required value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} /></label>
          <label className="form-field"><span className="form-label">Adresse e-mail</span><input className="form-input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="form-field"><span className="form-label">Téléphone</span><input className="form-input" value={form.telephone} onChange={(event) => setForm({ ...form, telephone: event.target.value })} /></label>
          <label className="form-field"><span className="form-label">Rôle</span><select className="form-input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="MEDECIN">Médecin</option><option value="INFIRMIER">Infirmier / agent</option><option value="ADMIN">Administrateur</option><option value="PATIENT">Patient</option></select></label>
          <label className="form-field"><span className="form-label">Mot de passe initial</span><input className="form-input" type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Création…' : 'Créer le compte'}</button>
      </form>}

      <section className="clinic-panel">
        <header className="panel-heading"><div><h3><Users size={16} /> Comptes enregistrés</h3><p>{users.length} utilisateur(s) · accès gérés par rôle</p></div></header>
        <div className="responsive-table-wrap"><table className="data-table admin-users-table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Créé le</th><th>Accès</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.prenom} {user.nom}</strong><small>{user.email}</small></td><td><span className={`role-badge role-badge-${String(user.role).toLowerCase()}`}>{user.role}</span></td><td><span className={`status-pill ${user.statut === 'ACTIF' ? 'status-confirmed' : 'status-default'}`}>{user.statut}</span></td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td><td><button className="table-action" type="button" onClick={() => toggleStatus(user)}>{user.statut === 'ACTIF' ? 'Désactiver' : 'Réactiver'}</button></td></tr>)}</tbody>
        </table></div>
        {!loading && !users.length && !error && <p className="panel-empty">Aucun utilisateur enregistré.</p>}
        {loading && <p className="panel-empty">Chargement des comptes…</p>}
      </section>
    </section>
  );
}