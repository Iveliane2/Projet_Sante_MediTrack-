import { useEffect, useMemo, useState } from 'react';
import { Activity, BellRing, CalendarClock, CircleAlert, Info } from 'lucide-react';
import api from '../services/api';

function listFrom(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function patientName(record) {
  const user = record.dossier_medical?.patient?.utilisateur || record.patient?.utilisateur;
  return [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Patient';
}

export default function AlertsPage() {
  const [now] = useState(() => Date.now());
  const [measurements, setMeasurements] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/constantes'), api.get('/rendezvous')])
      .then(([measurementResponse, appointmentResponse]) => {
        if (!active) return;
        setMeasurements(listFrom(measurementResponse));
        setAppointments(listFrom(appointmentResponse));
      })
      .catch(() => {
        if (active) setError('Les alertes de suivi ne sont pas disponibles pour le moment.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const alerts = useMemo(() => {
    const items = [];

    measurements.forEach((measurement) => {
      const [systolic, diastolic] = String(measurement.tension_arterielle || '')
        .split('/')
        .map((value) => Number.parseInt(value, 10));
      const glucose = Number(measurement.glycemie);
      const date = measurement.date_mesure ? new Date(measurement.date_mesure) : null;
      if ((systolic >= 160 || diastolic >= 100) && Number.isFinite(systolic)) {
        items.push({
          id: `pressure-${measurement.id}`,
          icon: Activity,
          title: 'Mesure de tension à vérifier',
          detail: `${patientName(measurement)} · ${measurement.tension_arterielle} mmHg`,
          date,
          kind: 'attention',
        });
      }
      if (Number.isFinite(glucose) && glucose > 1.26) {
        items.push({
          id: `glucose-${measurement.id}`,
          icon: CircleAlert,
          title: 'Glycémie au-dessus du repère indicatif',
          detail: `${patientName(measurement)} · ${measurement.glycemie} g/L`,
          date,
          kind: 'attention',
        });
      }
    });

    appointments.forEach((appointment) => {
      const date = appointment.date_heure ? new Date(appointment.date_heure) : null;
      if (date && date.getTime() >= now && date.getTime() <= now + 48 * 60 * 60 * 1000) {
        items.push({
          id: `appointment-${appointment.id}`,
          icon: CalendarClock,
          title: 'Rendez-vous dans les prochaines 48 heures',
          detail: `${patientName(appointment)} · ${date.toLocaleString('fr-FR')}`,
          date,
          kind: 'reminder',
        });
      }
    });

    return items.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }, [appointments, measurements, now]);

  return (
    <section className="page-section">
      <header className="section-header">
        <div>
          <p className="eyebrow">Prévention et suivi</p>
          <h2>Alertes de suivi</h2>
          <p className="small">Repères indicatifs à revoir avec l’équipe soignante. Ils ne constituent pas un diagnostic.</p>
        </div>
        <span className="status-pill status-default"><BellRing size={14} /> {alerts.length} à consulter</span>
      </header>

      {error && <p className="dashboard-error" role="alert">{error}</p>}
      {loading ? <p className="empty-row">Chargement des alertes…</p> : alerts.length ? (
        <div className="alert-list">
          {alerts.map(({ id, icon: Icon, title, detail, date, kind }) => (
            <article className={`alert-row alert-${kind}`} key={id}>
              <span className="alert-icon"><Icon size={18} /></span>
              <div className="alert-copy">
                <h3>{title}</h3>
                <p>{detail}</p>
                {date && <time>{date.toLocaleString('fr-FR')}</time>}
              </div>
              <span className="alert-kind">{kind === 'attention' ? 'À vérifier' : 'Rappel'}</span>
            </article>
          ))}
        </div>
      ) : (
        <section className="clinic-panel alert-empty">
          <Info size={22} />
          <div><strong>Aucun rappel de suivi pour le moment</strong><p>Les alertes apparaîtront à partir des mesures et rendez-vous disponibles.</p></div>
        </section>
      )}
    </section>
  );
}