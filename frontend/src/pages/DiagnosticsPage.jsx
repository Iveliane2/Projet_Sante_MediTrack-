import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState([]);

  useEffect(() => {
    api.get('/diagnostics')
      .then((response) => setDiagnostics(response.data?.data ?? response.data ?? []))
      .catch(() => setDiagnostics([]));
  }, []);

  const totalDiagnostics = diagnostics.length;
  const confirmedCount = diagnostics.filter((item) => item.statut === 'confirmé').length;
  const pendingCount = diagnostics.filter((item) => item.statut === 'en attente').length;

  return (
    <div className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h2>Suivi des analyses et des conclusions</h2>
        </div>
      </div>

      <div className="summary-grid">
        <article className="stat-card">
          <p className="stat-label">Total</p>
          <p className="stat-value">{totalDiagnostics}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Confirmés</p>
          <p className="stat-value">{confirmedCount}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">En attente</p>
          <p className="stat-value">{pendingCount}</p>
        </article>
      </div>

      <section className="table-card">
        <div className="card-header">
          <div>
            <p className="section-title">Diagnostics récents</p>
            <p className="small">Détails des analyses par patient.</p>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Conclusion</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((diagnostic) => (
              <tr key={diagnostic.id}>
                <td>{diagnostic.dossier_medical?.patient?.utilisateur?.prenom} {diagnostic.dossier_medical?.patient?.utilisateur?.nom}</td>
                <td>{diagnostic.conclusion || 'N/A'}</td>
                <td><span className={`status-pill ${diagnostic.statut === 'confirmé' ? 'status-confirmed' : diagnostic.statut === 'en attente' ? 'status-pending' : 'status-default'}`}>{diagnostic.statut || 'Non défini'}</span></td>
                <td>{diagnostic.created_at ? new Date(diagnostic.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {diagnostics.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">Aucun diagnostic trouvé pour le moment.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
