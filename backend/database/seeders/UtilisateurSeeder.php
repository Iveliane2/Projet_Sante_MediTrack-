<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        Utilisateur::create([
            'nom' => 'Mbuyi',
            'prenom' => 'Jean',
            'email' => 'jean@example.com',
            'telephone' => '0812345678',
            'password' => Hash::make('password123'),
            'role' => 'PATIENT',
            'statut' => 'ACTIF',
        ]);

        Utilisateur::create([
            'nom' => 'Kabasele',
            'prenom' => 'Marie',
            'email' => 'marie@example.com',
            'telephone' => '0823456789',
            'password' => Hash::make('password123'),
            'role' => 'MEDECIN',
            'statut' => 'ACTIF',
        ]);
    }
}
