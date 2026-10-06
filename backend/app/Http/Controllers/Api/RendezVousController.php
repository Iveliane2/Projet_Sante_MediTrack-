<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use App\Support\PatientRecordScope;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        return PatientRecordScope::apply(
            RendezVous::with(['patient.utilisateur', 'medecin.utilisateur']),
            $request,
            'patient',
        )->get();
    }

    public function store(Request $request)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'INFIRMIER', 'ADMIN']);
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'date_heure' => 'required|date',
            'motif' => 'nullable|string',
            'statut' => 'in:PLANIFIE,ANNULE,TERMINE',
        ]);

        $rdv = RendezVous::create($validated);

        return response()->json($rdv->load(['patient.utilisateur', 'medecin.utilisateur']), 201);
    }

    public function show(Request $request, RendezVous $rendezVous)
    {
        PatientRecordScope::apply(RendezVous::query(), $request, 'patient')
            ->findOrFail($rendezVous->id);
        return $rendezVous->load(['patient.utilisateur', 'medecin.utilisateur']);
    }

    public function update(Request $request, RendezVous $rendezVous)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'INFIRMIER', 'ADMIN']);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'medecin_id' => 'sometimes|exists:medecins,id',
            'date_heure' => 'nullable|date',
            'motif' => 'nullable|string',
            'statut' => 'in:PLANIFIE,ANNULE,TERMINE',
        ]);

        $rendezVous->update($validated);

        return $rendezVous->fresh()->load(['patient.utilisateur', 'medecin.utilisateur']);
    }

    public function destroy(Request $request, RendezVous $rendezVous)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'INFIRMIER', 'ADMIN']);
        $rendezVous->delete();

        return response()->json(['message' => 'Rendez-vous supprimé avec succès']);
    }
}
