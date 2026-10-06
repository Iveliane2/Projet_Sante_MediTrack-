<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    protected $fillable = [
        'dossier_medical_id',
        'medecin_id',
        'conclusion',
        'date_diagnostic',
    ];

    public function dossierMedical()
    {
        return $this->belongsTo(DossierMedical::class, 'dossier_medical_id');
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class, 'medecin_id');
    }

    public function traitements()
    {
        return $this->hasMany(Traitement::class, 'diagnostic_id');
    }
}
