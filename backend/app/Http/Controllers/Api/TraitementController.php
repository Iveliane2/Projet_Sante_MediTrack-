<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Traitement;
use App\Support\PatientRecordScope;
use Illuminate\Http\Request;

class TraitementController extends Controller
{
    public function index(Request $request)
    {
        return PatientRecordScope::apply(
            Traitement::with(['diagnostic.dossierMedical.patient.utilisateur', 'diagnostic.medecin.utilisateur']),
            $request,
            'diagnostic.dossierMedical.patient',
        )->get();
    }

    public function store(Request $request)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $validated = $request->validate([
            'diagnostic_id' => 'required|exists:diagnostics,id',
            'medicament' => 'nullable|string',
            'posologie' => 'nullable|string',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'statut' => 'in:EN_COURS,TERMINE,SUSPENDU',
        ]);

        $traitement = Traitement::create($validated);

        return response()->json($traitement->load(['diagnostic.dossierMedical.patient.utilisateur', 'diagnostic.medecin.utilisateur']), 201);
    }

    public function show(Request $request, Traitement $traitement)
    {
        PatientRecordScope::apply(Traitement::query(), $request, 'diagnostic.dossierMedical.patient')
            ->findOrFail($traitement->id);
        return $traitement->load(['diagnostic.dossierMedical.patient.utilisateur', 'diagnostic.medecin.utilisateur']);
    }

    public function update(Request $request, Traitement $traitement)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $validated = $request->validate([
            'diagnostic_id' => 'sometimes|exists:diagnostics,id',
            'medicament' => 'nullable|string',
            'posologie' => 'nullable|string',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'statut' => 'in:EN_COURS,TERMINE,SUSPENDU',
        ]);

        $traitement->update($validated);

        return $traitement->fresh()->load(['diagnostic.dossierMedical.patient.utilisateur', 'diagnostic.medecin.utilisateur']);
    }

    public function destroy(Request $request, Traitement $traitement)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $traitement->delete();

        return response()->json(['message' => 'Traitement supprimé avec succès']);
    }
}
