import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = {
  dossier_medical_id: '',
  tension_arterielle: '',
  glycemie: '',
  poids: '',
  temperature: '',
};

function listFrom(response) {
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function patientName(record) {
  const user = record.dossier_medical?.patient?.utilisateur
    || record.patient?.utilisateur
    || record.utilisateur;
  return [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Patient';
}

export default function ConstantesPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadData() {
    try {
      const [measurements, patientResponse] = await Promise.all([
        api.get('/constantes'),
        api.get('/patients'),
      ]);
      setRecords(listFrom(measurements));
      setPatients(listFrom(patientResponse));
    } catch {
      setError('Impossible de charger les constantes et les dossiers médicaux.');
    } finally {
      setLoading(false);
    }
  }

  function refreshData() {
    setLoading(true);
    setError('');
    loadData();
  }

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/constantes'), api.get('/patients')])
      .then(([measurements, patientResponse]) => {
        if (!active) return;
        setRecords(listFrom(measurements));
        setPatients(listFrom(patientResponse));
      })
      .catch(() => {
        if (active) setError('Impossible de charger les constantes et les dossiers médicaux.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const hasMeasurement = ['tension_arterielle', 'glycemie', 'poids', 'temperature']
      .some((field) => form[field] !== '');
    if (!hasMeasurement) {
      setError('Saisissez au moins une constante.');
      return;
    }

    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== ''),
      );
      await api.post('/constantes', payload);
      setForm(emptyForm);
      setNotice('Mesure ajoutée au dossier médical.');
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'La mesure n’a pas pu être enregistrée.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-section constants-page">
      <header className="section-header">
        <div>
          <p className="eyebrow">Suivi médical</p>
          <h2 className="constants-title">Constantes des patients</h2>
          <p className="small">Mesures enregistrées dans les dossiers médicaux.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={refreshData} disabled={loading}>
          <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
          Actualiser
        </button>
      </header>

      <div className="constants-layout">
        <form className="table-card constants-form" onSubmit={submit}>
          <div className="card-header">
            <div>
              <p className="section-title">Nouvelle mesure</p>
              <p className="small">Renseignez une ou plusieurs valeurs.</p>
            </div>
          </div>
          <label className="form-field">
            <span className="form-label">Dossier patient</span>
            <select
              className="form-input"
              name="dossier_medical_id"
              value={form.dossier_medical_id}
              onChange={updateField}
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.filter((patient) => patient.dossier_medical_id).map((patient) => (
                <option key={patient.id} value={patient.dossier_medical_id}>
                  {patientName(patient)} · {patient.numero_dossier || `#${patient.id}`}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-label">Tension artérielle (mmHg)</span>
            <input className="form-input" name="tension_arterielle" value={form.tension_arterielle} onChange={updateField} placeholder="120/80" />
          </label>
          <div className="constants-input-grid">
            <label className="form-field">
              <span className="form-label">Glycémie (g/L)</span>
              <input className="form-input" type="number" min="0" max="1000" step="0.01" name="glycemie" value={form.glycemie} onChange={updateField} placeholder="1.00" />
            </label>
            <label className="form-field">
              <span className="form-label">Poids (kg)</span>
              <input className="form-input" type="number" min="0" max="500" step="0.01" name="poids" value={form.poids} onChange={updateField} placeholder="70.00" />
            </label>
          </div>
          <label className="form-field">
            <span className="form-label">Température (°C)</span>
            <input className="form-input" type="number" min="25" max="50" step="0.1" name="temperature" value={form.temperature} onChange={updateField} placeholder="37.0" />
          </label>
          {error && <p className="error-text" role="alert">{error}</p>}
          {notice && <p className="constants-notice" role="status">{notice}</p>}
          <button className="btn btn-primary constants-submit" type="submit" disabled={saving || !patients.some((patient) => patient.dossier_medical_id)}>
            {saving ? 'Enregistrement…' : 'Enregistrer la mesure'}
          </button>
        </form>

        <section className="table-card constants-history">
          <div className="card-header">
            <div>
              <p className="section-title">Historique récent</p>
              <p className="small">{records.length} mesure(s)</p>
            </div>
          </div>
          {loading ? <p className="empty-row">Chargement des mesures…</p> : (
            <div className="constants-table-wrap">
              <table className="patients-table constants-table">
                <thead>
                  <tr><th>Patient</th><th>Date</th><th>Tension</th><th>Glycémie</th><th>Poids</th><th>Temp.</th></tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{patientName(record)}</td>
                      <td>{record.date_mesure ? new Date(record.date_mesure).toLocaleString('fr-FR') : '—'}</td>
                      <td>{record.tension_arterielle || '—'}</td>
                      <td>{record.glycemie ? `${record.glycemie} g/L` : '—'}</td>
                      <td>{record.poids ? `${record.poids} kg` : '—'}</td>
                      <td>{record.temperature ? `${record.temperature} °C` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!records.length && <p className="empty-row">Aucune mesure enregistrée.</p>}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}