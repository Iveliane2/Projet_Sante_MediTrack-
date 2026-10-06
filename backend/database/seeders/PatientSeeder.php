<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $user = Utilisateur::where('email', 'jean@example.com')->first();

        if ($user) {
            Patient::create([
                'utilisateur_id' => $user->id,
                'numero_dossier' => 'D-1001',
                'date_naissance' => '1990-01-15',
                'sexe' => 'M',
                'adresse' => 'Kinshasa, Gombe',
                'groupe_sanguin' => 'O+',
            ]);
        }
    }
}
