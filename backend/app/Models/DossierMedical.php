<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DossierMedical extends Model
{
    protected $fillable = [
        'patient_id',
        'date_ouverture',
        'antecedents',
        'allergies',
        'observations',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function diagnostics()
    {
        return $this->hasMany(Diagnostic::class, 'dossier_medical_id');
    }

    public function constantesMedicales()
    {
        return $this->hasMany(ConstanteMedicale::class, 'dossier_medical_id');
    }

    public function symptomes()
    {
        return $this->hasMany(Symptome::class, 'dossier_medical_id');
    }
}
