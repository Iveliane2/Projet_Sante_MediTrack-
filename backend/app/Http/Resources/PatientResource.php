<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dossier_medical_id' => $this->dossierMedical?->id,
            'numero_dossier' => $this->numero_dossier,
            'date_naissance' => $this->date_naissance,
            'sexe' => $this->sexe,
            'adresse' => $this->adresse,
            'groupe_sanguin' => $this->groupe_sanguin,
            'dossier_medical' => $this->whenLoaded('dossierMedical', fn () => [
                'id' => $this->dossierMedical->id,
                'date_ouverture' => $this->dossierMedical->date_ouverture,
                'antecedents' => $this->dossierMedical->antecedents,
                'allergies' => $this->dossierMedical->allergies,
                'observations' => $this->dossierMedical->observations,
            ]),
            'utilisateur' => [
                'id' => $this->utilisateur?->id,
                'nom' => $this->utilisateur?->nom,
                'prenom' => $this->utilisateur?->prenom,
                'email' => $this->utilisateur?->email,
            ],
        ];
    }
}
