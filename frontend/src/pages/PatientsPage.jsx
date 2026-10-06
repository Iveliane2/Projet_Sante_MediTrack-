import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import api from '../services/api';

const normalizeList = (response) => {
  if (!response) return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return response.data || [];
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patients')
      .then((response) => setPatients(normalizeList(response)))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(
    () => patients.filter((patient) => {
      const fullName = `${patient.utilisateur?.prenom ?? ''} ${patient.utilisateur?.nom ?? ''}`.toLowerCase();
      return fullName.includes(query.toLowerCase()) || (patient.utilisateur?.email ?? '').toLowerCase().includes(query.toLowerCase());
    }),
    [patients, query],
  );

  return (
    <div className="patients-page">
      <div className="page-actions">
        <div>
          <p className="eyebrow">Suivi clinique</p>
          <h2 className="page-title">Patients</h2>
          <p className="small">Rechercher un patient et ouvrir son dossier médical.</p>
        </div>
        <label className="patient-search-wrap"><Search size={17} aria-hidden="true" /><input
          className="patient-search"
          placeholder="Nom, e-mail ou numéro de dossier"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        /></label>
      </div>

      <section className="table-card">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Dossier</th>
              <th>Accès</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.utilisateur?.prenom} {patient.utilisateur?.nom}</td>
                <td>{patient.utilisateur?.email || '—'}</td>
                <td>{patient.telephone || '—'}</td>
                <td>{patient.numero_dossier || 'N/A'}</td>
                <td><button className="table-action" type="button" onClick={() => navigate(`/app/patients/${patient.id}`)} aria-label={`Ouvrir le dossier de ${patient.utilisateur?.prenom || 'ce patient'}`}><ArrowUpRight size={16} /> Ouvrir</button></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="empty-row">
                  {loading ? 'Chargement des patients…' : 'Aucun patient trouvé.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
