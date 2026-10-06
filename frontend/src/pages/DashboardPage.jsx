import { Activity, ArrowRight, CalendarDays, HeartPulse, Pill, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const normalizeList = (response) => {
  if (!response) return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return response.data || [];
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase();
  const [patients, setPatients] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [rendezvous, setRendezvous] = useState([]);
  const [traitements, setTraitements] = useState([]);
  const [constantes, setConstantes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [pressure, setPressure] = useState('');
  const [glucose, setGlucose] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setLoadError('');
      try {
        const [patientsRes, diagnosticsRes, rendezvousRes, traitementsRes, constantesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/diagnostics'),
          api.get('/rendezvous'),
          api.get('/traitements'),
          api.get('/constantes'),
        ]);

        if (!active) return;
        setPatients(normalizeList(patientsRes));
        setDiagnostics(normalizeList(diagnosticsRes));
        setRendezvous(normalizeList(rendezvousRes));
        setTraitements(normalizeList(traitementsRes));
        setConstantes(normalizeList(constantesRes));
        if (role === 'ADMIN') {
          const usersResponse = await api.get('/utilisateurs');
          if (active) setUsers(normalizeList(usersResponse));
        }
      } catch {
        if (!active) return;
        setLoadError('Certaines données n’ont pas pu être chargées. Réessayez dans un instant.');
        setPatients([]);
        setDiagnostics([]);
        setRendezvous([]);
        setTraitements([]);
        setConstantes([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => { active = false; };
  }, [role, refreshVersion]);

  const upcomingAppointments = useMemo(
    () => rendezvous
      .filter((item) => item.date_heure)
      .sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure))
      .slice(0, 4),
    [rendezvous],
  );
  const latestMeasurements = useMemo(
    () => [...constantes]
      .sort((a, b) => new Date(b.date_mesure) - new Date(a.date_mesure))
      .slice(0, 5),
    [constantes],
  );
  const nextAppointments = upcomingAppointments.filter((item) => new Date(item.date_heure) >= new Date());
  const inProgressTreatments = traitements.filter((item) => item.statut === 'EN_COURS');
  const activeUsers = users.filter((item) => item.statut === 'ACTIF');
  const doctors = users.filter((item) => item.role === 'MEDECIN');
  const nurses = users.filter((item) => item.role === 'INFIRMIER');
  const htaPatientIds = new Set(diagnostics
    .filter((item) => /hta|hypertension/i.test(item.conclusion || ''))
    .map((item) => item.dossier_medical?.patient?.id)
    .filter(Boolean));
  const diabetesPatientIds = new Set(diagnostics
    .filter((item) => /diabète|diabete/i.test(item.conclusion || ''))
    .map((item) => item.dossier_medical?.patient?.id)
    .filter(Boolean));
  const trendPatientId = latestMeasurements[0]?.dossier_medical?.patient?.id;
  const patientTrend = trendPatientId
    ? constantes
      .filter((item) => item.dossier_medical?.patient?.id === trendPatientId)
      .sort((a, b) => new Date(a.date_mesure) - new Date(b.date_mesure))
      .slice(-7)
    : [];
  const trendPatientName = [latestMeasurements[0]?.dossier_medical?.patient?.utilisateur?.prenom, latestMeasurements[0]?.dossier_medical?.patient?.utilisateur?.nom]
    .filter(Boolean)
    .join(' ') || 'Patient';
  const patientsToCheck = constantes.filter((item) => {
    const systolic = Number.parseInt(String(item.tension_arterielle || '').split('/')[0], 10);
    return systolic >= 160 || Number(item.glycemie) > 1.26;
  });

  async function saveNurseMeasurement(event) {
    event.preventDefault();
    const patient = patients.find((item) => String(item.id) === selectedPatient);
    if (!patient?.dossier_medical_id) {
      setLoadError('Ce patient ne possède pas encore de dossier médical.');
      return;
    }
    if (!pressure && !glucose && !weight) {
      setLoadError('Saisissez au moins une constante.');
      return;
    }

    setSaving(true);
    setLoadError('');
    setNotice('');
    try {
      const [systolic, diastolic] = pressure.split('/').map((value) => value.trim());
      await api.post('/constantes', {
        dossier_medical_id: patient.dossier_medical_id,
        ...(pressure && { tension_arterielle: `${systolic}/${diastolic || ''}` }),
        ...(glucose && { glycemie: Number(glucose) }),
        ...(weight && { poids: Number(weight) }),
      });
      setNotice('Les constantes ont été ajoutées au dossier du patient.');
      setPressure('');
      setGlucose('');
      setWeight('');
      setRefreshVersion((value) => value + 1);
    } catch (requestError) {
      setLoadError(requestError.response?.data?.message || 'Enregistrement impossible. Vérifiez les valeurs saisies.');
    } finally {
      setSaving(false);
    }
  }

  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Équipe MediTrack';

  return (
    <div className="dashboard-page clinic-dashboard">
      <section className={`clinic-welcome role-welcome role-welcome-${role.toLowerCase()}`}>
        <div className="clinic-welcome-copy">
          <span className="clinic-kicker"><HeartPulse size={15} /> {role === 'ADMIN' ? 'Administration MediTrack' : role === 'INFIRMIER' ? 'Poste infirmier · Hôpital Général de Loandjili' : role === 'PATIENT' ? 'Mon suivi Médical · Hôpital Général de Loandjili' : 'Pôle HTA & diabète · Hôpital Général de Loandjili'}</span>
          <h2>{role === 'ADMIN' ? 'Administration de la plateforme' : role === 'INFIRMIER' ? 'Suivi quotidien des patients' : role === 'PATIENT' ? 'Mon tableau de bord de santé' : 'Tableau de bord clinique'}</h2>
          <p>{role === 'ADMIN' ? 'Comptes professionnels et activité des services hospitaliers.' : role === 'INFIRMIER' ? 'Triage, enregistrement des constantes et coordination des contrôles.' : role === 'PATIENT' ? `Bonjour ${displayName}. Retrouvez votre suivi, vos rendez-vous et vos constantes de santé.` : `Bienvenue ${displayName}. Vue d’ensemble du suivi ambulatoire HTA et diabète.`}</p>
        </div>
        <div className="clinic-actions">
          {role !== 'ADMIN' && role !== 'PATIENT' && <button className="btn btn-accent" type="button" onClick={() => navigate('/app/constantes')}><Activity size={16} /> Saisir une constante</button>}
          {role === 'PATIENT' && <button className="btn btn-accent" type="button" onClick={() => navigate('/app/constantes')}><Activity size={16} /> Voir mon suivi</button>}
          {role === 'ADMIN'
            ? <button className="btn btn-light" type="button" onClick={() => setRefreshVersion((value) => value + 1)}><Users size={16} /> Actualiser les comptes</button>
            : role !== 'PATIENT' ? <button className="btn btn-light" type="button" onClick={() => navigate('/app/patients')}><Users size={16} /> Voir les patients</button> : <button className="btn btn-light" type="button" onClick={() => navigate('/app/rendezvous')}><CalendarDays size={16} /> Voir mes rendez-vous</button>}
        </div>
      </section>

      {loadError && <p className="dashboard-error" role="alert">{loadError}</p>}

      {role === 'PATIENT' ? (
        <section className="clinic-kpis" aria-label="Vue du patient">
          <KpiCard label="Mes constantes" value={constantes.length} detail="Valeurs enregistrées" icon={<Activity size={19} />} tone="teal" loading={loading} />
          <KpiCard label="Rendez-vous" value={nextAppointments.length} detail="Consultations prévues" icon={<CalendarDays size={19} />} tone="sky" loading={loading} />
          <KpiCard label="Traitements" value={inProgressTreatments.length} detail="Prescriptions actives" icon={<Pill size={19} />} tone="blue" loading={loading} />
          <KpiCard label="Contrôle" value={patientsToCheck.length ? 'À surveiller' : 'Stable'} detail={patientsToCheck.length ? 'Valeurs à vérifier' : 'Suivi conforme'} icon={<ShieldCheck size={19} />} tone="rose" loading={loading} />
        </section>
      ) : role === 'ADMIN' ? (
        <section className="clinic-kpis" aria-label="Vue d'ensemble administration">
          <KpiCard label="Comptes professionnels" value={users.length} detail="Utilisateurs système" icon={<Users size={19} />} tone="teal" loading={loading} />
          <KpiCard label="Médecins" value={doctors.length} detail="Accès diagnostics et traitements" icon={<HeartPulse size={19} />} tone="blue" loading={loading} />
          <KpiCard label="Infirmiers" value={nurses.length} detail="Suivi et saisie des constantes" icon={<Activity size={19} />} tone="sky" loading={loading} />
          <KpiCard label="Comptes actifs" value={activeUsers.length} detail="Statut ACTIF" icon={<ShieldCheck size={19} />} tone="rose" loading={loading} />
        </section>
      ) : role === 'INFIRMIER' ? (
        <section className="clinic-kpis" aria-label="Vue d'ensemble infirmier">
          <KpiCard label="Patients suivis" value={patients.length} detail="Patients enregistrés" icon={<Users size={19} />} tone="blue" loading={loading} />
          <KpiCard label="À contrôler" value={patientsToCheck.length} detail="Selon les dernières valeurs" icon={<HeartPulse size={19} />} tone="rose" loading={loading} />
          <KpiCard label="Mesures enregistrées" value={constantes.length} detail="Historique disponible" icon={<Activity size={19} />} tone="teal" loading={loading} />
          <KpiCard label="Rendez-vous" value={nextAppointments.length} detail="Consultations à venir" icon={<CalendarDays size={19} />} tone="sky" loading={loading} />
        </section>
      ) : (
        <section className="clinic-kpis" aria-label="Vue d'ensemble médecin">
          <KpiCard label="Patients suivis" value={patients.length} detail="Patients enregistrés" icon={<Users size={19} />} tone="blue" loading={loading} />
          <KpiCard label="Patients HTA" value={htaPatientIds.size} detail="Identifiés dans les diagnostics" icon={<HeartPulse size={19} />} tone="blue" loading={loading} />
          <KpiCard label="Patients diabétiques" value={diabetesPatientIds.size} detail="Identifiés dans les diagnostics" icon={<Activity size={19} />} tone="teal" loading={loading} />
          <KpiCard label="Rendez-vous à venir" value={nextAppointments.length} detail="Consultations programmées" icon={<CalendarDays size={19} />} tone="sky" loading={loading} />
        </section>
      )}

      {role === 'MEDECIN' && (
        <section className="trend-grid" aria-label="Évolution des constantes du patient récemment suivi">
          <TrendPanel
            title="Évolution de la tension"
            patientName={trendPatientName}
            items={patientTrend}
            value={(item) => Number.parseInt(String(item.tension_arterielle || '').split('/')[0], 10)}
            format={(item) => item.tension_arterielle ? `${item.tension_arterielle} mmHg` : '—'}
            unit="mmHg"
          />
          <TrendPanel
            title="Évolution de la glycémie"
            patientName={trendPatientName}
            items={patientTrend}
            value={(item) => Number(item.glycemie)}
            format={(item) => item.glycemie ? `${item.glycemie} g/L` : '—'}
            unit="g/L"
          />
        </section>
      )}

      {role === 'INFIRMIER' && (
        <section className="nurse-workspace">
          <form className="clinic-panel nurse-entry-panel" onSubmit={saveNurseMeasurement}>
            <header className="panel-heading"><div><h3>Saisie rapide au poste infirmier</h3><p>Les valeurs sont enregistrées dans le dossier médical.</p></div></header>
            <label className="form-field"><span className="form-label">Patient</span>
              <select className="form-input" value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)} required>
                <option value="">Sélectionner un patient</option>
                {patients.filter((patient) => patient.dossier_medical_id).map((patient) => <option key={patient.id} value={patient.id}>{[patient.utilisateur?.prenom, patient.utilisateur?.nom].filter(Boolean).join(' ')} · {patient.numero_dossier || `#${patient.id}`}</option>)}
              </select>
            </label>
            <label className="form-field"><span className="form-label">Tension artérielle (mmHg)</span><input className="form-input" value={pressure} onChange={(event) => setPressure(event.target.value)} placeholder="120/80" pattern="[0-9]{2,3}/[0-9]{2,3}" /></label>
            <div className="nurse-fields-row">
              <label className="form-field"><span className="form-label">Glycémie (g/L)</span><input className="form-input" type="number" step="0.01" min="0" max="1000" value={glucose} onChange={(event) => setGlucose(event.target.value)} placeholder="1.00" /></label>
              <label className="form-field"><span className="form-label">Poids (kg)</span><input className="form-input" type="number" step="0.1" min="0" max="500" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="70" /></label>
            </div>
            {notice && <p className="constants-notice" role="status">{notice}</p>}
            <button className="btn btn-primary" type="submit" disabled={saving || loading}>{saving ? 'Enregistrement…' : 'Enregistrer les mesures'}</button>
          </form>
          <section className="clinic-panel">
            <header className="panel-heading"><div><h3>Patients nécessitant une attention</h3><p>Repérage indicatif à partir des dernières mesures saisies.</p></div><span className="status-pill status-pending">{patientsToCheck.length}</span></header>
            {patientsToCheck.length ? patientsToCheck.slice(0, 8).map((item) => {
              const patient = item.dossier_medical?.patient;
              const name = [patient?.utilisateur?.prenom, patient?.utilisateur?.nom].filter(Boolean).join(' ') || 'Patient';
              return <article className="attention-row" key={item.id}><span className="attention-dot" /><div><strong>{name}</strong><span>{item.tension_arterielle ? `TA ${item.tension_arterielle} mmHg` : ''}{item.glycemie ? ` · Glycémie ${item.glycemie} g/L` : ''}</span></div><button className="text-action" type="button" onClick={() => navigate('/app/patients')}>Dossiers <ArrowRight size={14} /></button></article>;
            }) : <p className="panel-empty">Aucune mesure au-dessus des repères de triage affichés.</p>}
          </section>
        </section>
      )}

      {role === 'ADMIN' ? (
        <div className="clinic-content-grid">
          <section className="clinic-panel admin-accounts-panel">
            <header className="panel-heading"><div><h3>Comptes professionnels</h3><p>Rôles et état d’activité renvoyés par le serveur.</p></div></header>
            {users.filter((item) => ['MEDECIN', 'INFIRMIER', 'ADMIN'].includes(item.role)).map((item) => (
              <article className="admin-user-row" key={item.id}><span className="patient-avatar">{`${item.prenom?.[0] || ''}${item.nom?.[0] || ''}`}</span><div><strong>{item.prenom} {item.nom}</strong><span>{item.email}</span></div><span className={`role-badge role-badge-${item.role.toLowerCase()}`}>{item.role}</span><span className={item.statut === 'ACTIF' ? 'account-active' : 'account-inactive'}>{item.statut}</span></article>
            ))}
            {!users.length && <p className="panel-empty">Aucun compte professionnel disponible.</p>}
          </section>
          <section className="clinic-panel">
            <header className="panel-heading"><div><h3>Activité de la plateforme</h3><p>Volumes présents dans la base de données.</p></div></header>
            <div className="admin-volume-row"><span>Patients</span><strong>{patients.length}</strong></div>
            <div className="admin-volume-row"><span>Diagnostics</span><strong>{diagnostics.length}</strong></div>
            <div className="admin-volume-row"><span>Constantes médicales</span><strong>{constantes.length}</strong></div>
            <div className="admin-volume-row"><span>Rendez-vous</span><strong>{rendezvous.length}</strong></div>
          </section>
        </div>
      ) : (
      <div className="clinic-content-grid">
        <section className="clinic-panel">
          <header className="panel-heading">
            <div><h3>Prochains rendez-vous</h3><p>Consultations programmées</p></div>
            <button className="text-action" type="button" onClick={() => navigate('/app/rendezvous')}>Tout voir <ArrowRight size={15} /></button>
          </header>
          {nextAppointments.length ? (
            <div className="appointment-list">
              {nextAppointments.map((item) => (
                <article className="appointment-row" key={item.id}>
                  <div className="appointment-date"><CalendarDays size={17} /><span>{new Date(item.date_heure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span></div>
                  <div className="appointment-info">
                    <strong>{[item.patient?.utilisateur?.prenom, item.patient?.utilisateur?.nom].filter(Boolean).join(' ') || 'Patient'}</strong>
                    <span>{item.motif || 'Consultation'} · {new Date(item.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="status-pill status-pending">{item.statut || 'Planifié'}</span>
                </article>
              ))}
            </div>
          ) : <p className="panel-empty">Aucun rendez-vous à venir.</p>}
        </section>

        <section className="clinic-panel measurement-panel">
          <header className="panel-heading">
            <div><h3>Constantes récentes</h3><p>Dernières mesures enregistrées</p></div>
            <button className="icon-action" type="button" title="Ouvrir le suivi médical" aria-label="Ouvrir le suivi médical" onClick={() => navigate('/app/constantes')}><ArrowRight size={17} /></button>
          </header>
          {latestMeasurements.length ? (
            <div className="measurement-list">
              {latestMeasurements.map((item) => {
                const patient = item.dossier_medical?.patient?.utilisateur;
                const values = [
                  item.tension_arterielle && `TA ${item.tension_arterielle}`,
                  item.glycemie && `Gly. ${item.glycemie} g/L`,
                  item.poids && `${item.poids} kg`,
                ].filter(Boolean);
                return <article className="measurement-row" key={item.id}>
                  <span className="measurement-mark"><Activity size={16} /></span>
                  <div><strong>{[patient?.prenom, patient?.nom].filter(Boolean).join(' ') || 'Patient'}</strong><span>{values.join(' · ') || 'Mesure enregistrée'}</span></div>
                  <time>{item.date_mesure ? new Date(item.date_mesure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}</time>
                </article>;
              })}
            </div>
          ) : <p className="panel-empty">Aucune constante enregistrée.</p>}
        </section>

        <section className="clinic-panel patient-panel">
          <header className="panel-heading">
            <div><h3>Patients récemment enregistrés</h3><p>Accès rapide aux dossiers</p></div>
            <button className="text-action" type="button" onClick={() => navigate('/app/patients')}>Tous les patients <ArrowRight size={15} /></button>
          </header>
          {patients.length ? (
            <div className="patient-list">
              {patients.slice(0, 5).map((patient) => {
                const name = [patient.utilisateur?.prenom, patient.utilisateur?.nom].filter(Boolean).join(' ') || 'Patient';
                return <article className="patient-row" key={patient.id}>
                  <span className="patient-avatar">{name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                  <div><strong>{name}</strong><span>{patient.numero_dossier || `Dossier #${patient.id}`}</span></div>
                  <span className="patient-email">{patient.utilisateur?.email || 'Coordonnées non renseignées'}</span>
                </article>;
              })}
            </div>
          ) : <p className="panel-empty">Aucun patient à afficher.</p>}
        </section>
      </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, detail, icon, tone, loading }) {
  return (
    <article className="clinic-kpi">
      <div className="kpi-top"><span>{label}</span><i className={`kpi-icon kpi-${tone}`}>{icon}</i></div>
      <strong>{loading ? '—' : value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function TrendPanel({ title, patientName, items, value, format, unit }) {
  const measuredItems = items.filter((item) => Number.isFinite(value(item)) && value(item) > 0);
  const maxValue = Math.max(...measuredItems.map(value), 1);

  return (
    <section className="clinic-panel trend-panel">
      <header className="panel-heading"><div><h3>{title}</h3><p>{patientName} · mesures individuelles récentes ({unit})</p></div></header>
      {measuredItems.length ? <div className="trend-bars" role="img" aria-label={`${title} pour ${patientName}`}>
        {measuredItems.map((item) => <div className="trend-column" key={item.id} title={format(item)}><strong>{format(item)}</strong><span className="trend-track"><i style={{ height: `${Math.max(8, value(item) / maxValue * 100)}%` }} /></span><time>{item.date_mesure ? new Date(item.date_mesure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}</time></div>)}
      </div> : <p className="panel-empty">Pas assez de mesures de ce type pour afficher une évolution.</p>}
    </section>
  );
}
