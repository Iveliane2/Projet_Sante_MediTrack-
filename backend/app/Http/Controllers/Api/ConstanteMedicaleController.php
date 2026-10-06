<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConstanteMedicale;
use App\Models\DossierMedical;
use Illuminate\Http\Request;

class ConstanteMedicaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = ConstanteMedicale::with('dossierMedical.patient.utilisateur')
            ->orderByDesc('date_mesure');

        if (request()->user()->role === 'PATIENT') {
            $query->whereHas('dossierMedical.patient', function ($patientQuery) {
                $patientQuery->where('utilisateur_id', request()->user()->id);
            });
        }

        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $dossier = DossierMedical::findOrFail($validated['dossier_medical_id']);
        $this->authorizeDossier($request, $dossier);

        return response()->json(
            ConstanteMedicale::create($validated)->load('dossierMedical.patient.utilisateur'),
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, ConstanteMedicale $constante)
    {
        $this->authorizeDossier($request, $constante->dossierMedical);

        return $constante->load('dossierMedical.patient.utilisateur');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ConstanteMedicale $constante)
    {
        abort_if($request->user()->role === 'PATIENT', 403);
        $this->authorizeDossier($request, $constante->dossierMedical);
        $validated = $request->validate($this->rules(false));

        if (isset($validated['dossier_medical_id'])) {
            $this->authorizeDossier($request, DossierMedical::findOrFail($validated['dossier_medical_id']));
        }

        $constante->update($validated);

        return $constante->fresh()->load('dossierMedical.patient.utilisateur');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ConstanteMedicale $constante)
    {
        abort_if($request->user()->role === 'PATIENT', 403);
        $this->authorizeDossier($request, $constante->dossierMedical);
        $constante->delete();

        return response()->json(['message' => 'Constante supprimée avec succès']);
    }

    private function rules(bool $creating = true): array
    {
        $measurementRequired = $creating
            ? 'required_without_all:glycemie,poids,temperature'
            : 'sometimes';

        return [
            'dossier_medical_id' => [$creating ? 'required' : 'sometimes', 'integer', 'exists:dossier_medicals,id'],
            'tension_arterielle' => [$measurementRequired, 'nullable', 'string', 'max:20'],
            'glycemie' => [$creating ? 'required_without_all:tension_arterielle,poids,temperature' : 'sometimes', 'nullable', 'numeric', 'between:0,1000'],
            'poids' => [$creating ? 'required_without_all:tension_arterielle,glycemie,temperature' : 'sometimes', 'nullable', 'numeric', 'between:0,500'],
            'temperature' => [$creating ? 'required_without_all:tension_arterielle,glycemie,poids' : 'sometimes', 'nullable', 'numeric', 'between:25,50'],
            'date_mesure' => ['sometimes', 'date'],
        ];
    }

    private function authorizeDossier(Request $request, DossierMedical $dossier): void
    {
        if ($request->user()->role === 'PATIENT') {
            abort_unless(
                $dossier->patient()->where('utilisateur_id', $request->user()->id)->exists(),
                403
            );
        }
    }
}
