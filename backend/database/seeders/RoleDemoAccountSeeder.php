<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleDemoAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'nom' => 'Mendosa',
                'prenom' => 'Aris',
                'email' => 'medecin@meditrack.local',
                'telephone' => '0600000101',
                'password' => 'Medecin-HGL-2026',
                'role' => 'MEDECIN',
            ],
            [
                'nom' => 'Mabiala',
                'prenom' => 'Jean-Pierre',
                'email' => 'infirmier@meditrack.local',
                'telephone' => '0600000102',
                'password' => 'Infirmier-HGL-2026',
                'role' => 'INFIRMIER',
            ],
            [
                'nom' => 'Ngoma',
                'prenom' => 'Celestin',
                'email' => 'admin@meditrack.local',
                'telephone' => '0600000103',
                'password' => 'Admin-HGL-2026',
                'role' => 'ADMIN',
            ],
            [
                'nom' => 'Mabanza',
                'prenom' => 'Patrice',
                'email' => 'patrice.mabanza@patient.loandjili.cg',
                'telephone' => '0600000104',
                'password' => 'Patrice-HGL-2026',
                'role' => 'PATIENT',
            ],
        ];

        foreach ($accounts as $account) {
            $email = $account['email'];
            $password = $account['password'];
            unset($account['password']);

            Utilisateur::firstOrCreate(
                ['email' => $email],
                [...$account, 'password' => Hash::make($password), 'statut' => 'ACTIF'],
            );
        }
    }
}