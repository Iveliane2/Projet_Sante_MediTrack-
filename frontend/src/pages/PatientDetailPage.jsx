import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Activity, CalendarDays, HeartPulse, Pill, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

function listFrom(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [collections, setCollections] = useState({ measurements: [], diagnostics: [], appointments: [], treatments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(`/patients/${patientId}`),
      api.get('/constantes'),
      api.get('/diagnostics'),
      api.get('/rendezvous'),
      api.get('/traitements'),
    ])
      .then(([patientResponse, measurementResponse, diagnosticResponse, appointmentResponse, treatmentResponse]) => {
        if (!active) return;
        const payload = patientResponse.data;
        setPatient(payload?.data || payload);
        setCollections({
          measurements: listFrom(measurementResponse),
          diagnostics: listFrom(diagnosticResponse),
          appointments: listFrom(appointmentResponse),
          treatments: listFrom(treatmentResponse),
        });
      })
      .catch(() => { if (active) setError('Impossible de charger ce dossier patient.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [patientId]);

  const dossierId = patient?.dossier_medical_id;
  const measurements = useMemo(() => collections.measurements.filter((item) => String(item.dossier_medical_id) === String(dossierId)), [collections.measurements, dossierId]);
  const diagnostics = useMemo(() => collections.diagnostics.filter((item) => String(item.dossier_medical_id || item.dossier_medical?.id) === String(dossierId)), [collections.diagnostics, dossierId]);
  const appointments = useMemo(() => collections.appointments.filter((item) => String(item.patient_id || item.patient?.id) === String(patientId)), [collections.appointments, patientId]);
  const diagnosticIds = new Set(diagnostics.map((item) => String(item.id)));
  const treatments = collections.treatments.filter((item) => diagnosticIds.has(String(item.diagnostic_id || item.diagnostic?.id)));
  const name = [patient?.utilisateur?.prenom, patient?.utilisateur?.nom].filter(Boolean).join(' ') || 'Dossier patient';
  const medicalFile = patient?.dossier_medical || {};
  const age = patient?.date_naissance
    ? Math.max(0, new Date().getFullYear() - new Date(patient.date_naissance).getFullYear())
    : null;

  if (loading) return <p className="empty-row">Chargement du dossier…</p>;
  if (error || !patient) return <p className="dashboard-error" role="alert">{error || 'Dossier patient introuvable.'}</p>;

  return (
    <section className="page-section patient-record-page">
      <Link className="text-action record-back" to="/app/patients"><ArrowLeft size={16} /> Retour aux patients</Link>
      <header className="record-heading clinic-panel">
        <span className="patient-avatar record-avatar"><UserRound size={22} /></span>
        <div><p className="eyebrow">Dossier médical · {patient.numero_dossier || `#${patient.id}`}</p><h2>{name}</h2><p>{age == null ? 'Âge non renseigné' : `${age} ans`} · {patient.sexe === 'M' ? 'Homme' : patient.sexe === 'F' ? 'Femme' : 'Sexe non renseigné'} · {patient.utilisateur?.email || 'Coordonnées non renseignées'}</p></div>
      </header>

      <section className="clinic-panel record-medical-summary">
        <header className="panel-heading"><div><h3>Résumé médical</h3><p>Antécédents et informations consignées dans le dossier</p></div></header>
        <div className="record-summary-grid">
          <div><span>Groupe sanguin</span><strong>{patient.groupe_sanguin || 'Non renseigné'}</strong></div>
          <div><span>Antécédents</span><strong>{medicalFile.antecedents || 'Non renseignés'}</strong></div>
          <div><span>Allergies</span><strong>{medicalFile.allergies || 'Non renseignées'}</strong></div>
          <div><span>Observations</span><strong>{medicalFile.observations || 'Aucune observation'}</strong></div>
        </div>
      </section>

      <div className="record-kpis">
        <article><HeartPulse size={18} /><span>Dernière tension</span><strong>{measurements[0]?.tension_arterielle || '—'}</strong></article>
        <article><Activity size={18} /><span>Dernière glycémie</span><strong>{measurements[0]?.glycemie ? `${measurements[0].glycemie} g/L` : '—'}</strong></article>
        <article><Pill size={18} /><span>Traitements suivis</span><strong>{treatments.length}</strong></article>
        <article><CalendarDays size={18} /><span>Rendez-vous</span><strong>{appointments.length}</strong></article>
      </div>

      <div className="record-grid">
        <section className="clinic-panel">
          <header className="panel-heading"><div><h3>Constantes</h3><p>Historique récent transmis au dossier</p></div></header>
          <div className="record-list">{measurements.length ? measurements.map((item) => <article key={item.id}><time>{item.date_mesure ? new Date(item.date_mesure).toLocaleString('fr-FR') : 'Date inconnue'}</time><span>{item.tension_arterielle ? `TA ${item.tension_arterielle} mmHg` : ''}{item.glycemie ? ` · Glycémie ${item.glycemie} g/L` : ''}{item.poids ? ` · ${item.poids} kg` : ''}</span></article>) : <p className="panel-empty">Aucune constante enregistrée.</p>}</div>
        </section>
        <section className="clinic-panel">
          <header className="panel-heading"><div><h3>Diagnostics</h3><p>Informations consignées par le médecin</p></div></header>
          <div className="record-list">{diagnostics.length ? diagnostics.map((item) => <article key={item.id}><time>{item.date_diagnostic ? new Date(item.date_diagnostic).toLocaleDateString('fr-FR') : 'Date non renseignée'}</time><span>{item.conclusion || 'Conclusion non renseignée'}</span></article>) : <p className="panel-empty">Aucun diagnostic enregistré.</p>}</div>
        </section>
        <section className="clinic-panel">
          <header className="panel-heading"><div><h3>Traitements</h3><p>Prescriptions associées au dossier</p></div></header>
          <div className="record-list">{treatments.length ? treatments.map((item) => <article key={item.id}><strong>{item.medicament || 'Traitement'}</strong><span>{item.posologie || 'Posologie non renseignée'} · {item.statut || 'Statut non renseigné'}</span></article>) : <p className="panel-empty">Aucun traitement enregistré.</p>}</div>
        </section>
        <section className="clinic-panel">
          <header className="panel-heading"><div><h3>Rendez-vous</h3><p>Agenda patient</p></div></header>
          <div className="record-list">{appointments.length ? appointments.map((item) => <article key={item.id}><time>{item.date_heure ? new Date(item.date_heure).toLocaleString('fr-FR') : 'Date inconnue'}</time><span>{item.motif || 'Consultation'} · {item.statut || 'Planifié'}</span></article>) : <p className="panel-empty">Aucun rendez-vous enregistré.</p>}</div>
        </section>
      </div>
    </section>
  );
}