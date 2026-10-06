<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_patients_index_returns_json(): void
    {
        $response = $this->getJson('/api/patients');

        $response->assertStatus(401);
    }

    public function test_patients_index_returns_json_for_authenticated_user(): void
    {
        $utilisateur = Utilisateur::create([
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'test@example.com',
            'telephone' => '0123456789',
            'password' => bcrypt('password123'),
            'role' => 'PATIENT',
            'statut' => 'ACTIF',
        ]);

        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/patients');

        $response->assertStatus(200);
    }
}
