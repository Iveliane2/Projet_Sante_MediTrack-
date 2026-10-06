<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Support\PatientRecordScope;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::with(['utilisateur', 'dossierMedical']);

        if (request()->user()->role === 'PATIENT') {
            $patients->where('utilisateur_id', request()->user()->id);
        }

        return PatientResource::collection($patients->get());
    }

    public function store(Request $request)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'INFIRMIER', 'ADMIN']);
        $patient = Patient::create($request->all());

        return new PatientResource($patient->load('utilisateur', 'dossierMedical'));
    }

    public function show(Request $request, Patient $patient)
    {
        abort_if(
            $request->user()->role === 'PATIENT'
                && $patient->utilisateur_id !== $request->user()->id,
            404,
        );
        return new PatientResource($patient->load('utilisateur'));
    }

    public function update(Request $request, Patient $patient)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['MEDECIN', 'INFIRMIER', 'ADMIN']);
        $patient->update($request->all());

        return new PatientResource($patient->fresh()->load('utilisateur'));
    }

    public function destroy(Request $request, Patient $patient)
    {
        PatientRecordScope::authorizeProfessionalMutation($request, ['ADMIN']);
        $patient->delete();

        return response()->json(['message' => 'Patient supprimé avec succès']);
    }
}
