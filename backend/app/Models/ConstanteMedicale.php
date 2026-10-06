<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConstanteMedicale extends Model
{
    protected $fillable = [
        'dossier_medical_id',
        'tension_arterielle',
        'glycemie',
        'poids',
        'temperature',
        'date_mesure',
    ];

    protected function casts(): array
    {
        return [
            'glycemie' => 'decimal:2',
            'poids' => 'decimal:2',
            'temperature' => 'decimal:1',
            'date_mesure' => 'datetime',
        ];
    }

    public function dossierMedical()
    {
        return $this->belongsTo(DossierMedical::class, 'dossier_medical_id');
    }
}
