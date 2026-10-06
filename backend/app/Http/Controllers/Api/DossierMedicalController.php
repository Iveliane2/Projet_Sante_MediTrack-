<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DossierMedical;
use App\Support\PatientRecordScope;
use Illuminate\Http\Request;

class DossierMedicalController extends Controller
{
    public function index(Request $request)
    {
        return PatientRecordScope::apply(
            DossierMedical::with('patient.utilisateur', 'diagnostics', 'constantesMedicales', 'symptomes'),
            $request,
            'patient',
        )->paginate(10);
    }

    public function store(Request $request)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'INFIRMIER', 'ADMIN']);
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'date_ouverture' => 'nullable|date',
            'antecedents' => 'nullable|string',
            'allergies' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        $dossier = DossierMedical::create($data);

        return response()->json($dossier->load('patient.utilisateur', 'diagnostics', 'constantesMedicales', 'symptomes'), 201);
    }

    public function show(Request $request, DossierMedical $dossierMedical)
    {
        PatientRecordScope::apply(DossierMedical::query(), $request, 'patient')
            ->findOrFail($dossierMedical->id);
        return $dossierMedical->load('patient.utilisateur', 'diagnostics', 'constantesMedicales', 'symptomes');
    }

    public function update(Request $request, DossierMedical $dossierMedical)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $data = $request->validate([
            'date_ouverture' => 'nullable|date',
            'antecedents' => 'nullable|string',
            'allergies' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        $dossierMedical->update($data);

        return response()->json($dossierMedical->load('patient.utilisateur', 'diagnostics', 'constantesMedicales', 'symptomes'));
    }

    public function destroy(Request $request, DossierMedical $dossierMedical)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['ADMIN']);
        $dossierMedical->delete();

        return response()->json(null, 204);
    }
}
