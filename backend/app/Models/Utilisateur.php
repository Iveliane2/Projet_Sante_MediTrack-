<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'password',
        'langue_preferee',
        'role',
        'statut',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function patient()
    {
        return $this->hasOne(Patient::class, 'utilisateur_id');
    }

    public function medecin()
    {
        return $this->hasOne(Medecin::class, 'utilisateur_id');
    }

    public function infirmier()
    {
        return $this->hasOne(Infirmier::class, 'utilisateur_id');
    }

    public function administrateur()
    {
        return $this->hasOne(Administrateur::class, 'utilisateur_id');
    }
}
