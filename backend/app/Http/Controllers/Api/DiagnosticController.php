<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostic;
use App\Support\PatientRecordScope;
use Illuminate\Http\Request;

class DiagnosticController extends Controller
{
    public function index(Request $request)
    {
        return PatientRecordScope::apply(
            Diagnostic::with(['dossierMedical.patient.utilisateur', 'medecin.utilisateur', 'traitements']),
            $request,
            'dossierMedical.patient',
        )->get();
    }

    public function store(Request $request)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $validated = $request->validate([
            'dossier_medical_id' => 'required|exists:dossier_medicals,id',
            'medecin_id' => 'required|exists:medecins,id',
            'conclusion' => 'nullable|string',
            'date_diagnostic' => 'nullable|date',
        ]);

        $diagnostic = Diagnostic::create($validated);

        return response()->json($diagnostic->load(['dossierMedical.patient.utilisateur', 'medecin.utilisateur', 'traitements']), 201);
    }

    public function show(Request $request, Diagnostic $diagnostic)
    {
        PatientRecordScope::apply(Diagnostic::query(), $request, 'dossierMedical.patient')
            ->findOrFail($diagnostic->id);
        return $diagnostic->load(['dossierMedical.patient.utilisateur', 'medecin.utilisateur', 'traitements']);
    }

    public function update(Request $request, Diagnostic $diagnostic)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $validated = $request->validate([
            'dossier_medical_id' => 'sometimes|exists:dossier_medicals,id',
            'medecin_id' => 'sometimes|exists:medecins,id',
            'conclusion' => 'nullable|string',
            'date_diagnostic' => 'nullable|date',
        ]);

        $diagnostic->update($validated);

        return $diagnostic->fresh()->load(['dossierMedical.patient.utilisateur', 'medecin.utilisateur', 'traitements']);
    }

    public function destroy(Request $request, Diagnostic $diagnostic)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'ADMIN']);
        $diagnostic->delete();

        return response()->json(['message' => 'Diagnostic supprimé avec succès']);
    }
}
