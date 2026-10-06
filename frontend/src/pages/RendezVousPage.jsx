import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function RendezVousPage() {
  const [rendezvous, setRendezvous] = useState([]);

  useEffect(() => {
    api.get('/rendezvous')
      .then((response) => setRendezvous(response.data?.data ?? response.data ?? []))
      .catch(() => setRendezvous([]));
  }, []);

  const upcoming = useMemo(
    () => rendezvous
      .filter((item) => item.date_heure)
      .sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure))
      .slice(0, 6),
    [rendezvous],
  );

  return (
    <div className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Rendez-vous</p>
          <h2>Planning des consultations</h2>
        </div>
      </div>

      <div className="summary-grid">
        <article className="stat-card">
          <p className="stat-label">Total</p>
          <p className="stat-value">{rendezvous.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Prochains</p>
          <p className="stat-value">{upcoming.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Confirmés</p>
          <p className="stat-value">{rendezvous.filter((item) => item.statut === 'confirmé').length}</p>
        </article>
      </div>

      <section className="table-card">
        <div className="card-header">
          <div>
            <p className="section-title">Calendrier</p>
            <p className="small">Rendez-vous planifiés et leur état.</p>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((rdv) => (
              <tr key={rdv.id}>
                <td>{new Date(rdv.date_heure).toLocaleString()}</td>
                <td>{rdv.patient?.utilisateur?.prenom} {rdv.patient?.utilisateur?.nom}</td>
                <td>{rdv.medecin?.utilisateur?.prenom} {rdv.medecin?.utilisateur?.nom}</td>
                <td><span className={`status-pill ${rdv.statut === 'confirmé' ? 'status-confirmed' : rdv.statut === 'annulé' ? 'status-cancelled' : 'status-pending'}`}>{rdv.statut || 'Programmé'}</span></td>
              </tr>
            ))}
            {upcoming.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">Aucun rendez-vous n’est encore programmé.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
