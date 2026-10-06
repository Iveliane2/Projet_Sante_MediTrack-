<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'utilisateur_id',
        'numero_dossier',
        'date_naissance',
        'sexe',
        'adresse',
        'groupe_sanguin',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function dossierMedical()
    {
        return $this->hasOne(DossierMedical::class, 'patient_id');
    }

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'patient_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'patient_id');
    }
}
