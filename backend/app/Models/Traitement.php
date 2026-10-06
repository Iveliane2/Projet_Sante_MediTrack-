<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Traitement extends Model
{
    protected $fillable = [
        'diagnostic_id',
        'medicament',
        'posologie',
        'date_debut',
        'date_fin',
        'statut',
    ];

    public function diagnostic()
    {
        return $this->belongsTo(Diagnostic::class, 'diagnostic_id');
    }
}
