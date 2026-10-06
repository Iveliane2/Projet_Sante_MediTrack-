<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_deactivate_a_user(): void
    {
        $admin = $this->createUser('admin@example.com', 'ADMIN');
        $this->actingAs($admin, 'sanctum');

        $created = $this->postJson('/api/utilisateurs', [
            'nom' => 'Mabanza',
            'prenom' => 'Patrice',
            'email' => 'patrice@example.com',
            'password' => 'patient-secret',
            'role' => 'PATIENT',
        ])->assertCreated()->assertJsonPath('statut', 'ACTIF');

        $userId = $created->json('id');
        $this->putJson("/api/utilisateurs/{$userId}", ['statut' => 'INACTIF'])
            ->assertOk()
            ->assertJsonPath('statut', 'INACTIF');
        $this->assertTrue(Hash::check('patient-secret', Utilisateur::findOrFail($userId)->password));
    }

    public function test_non_admin_cannot_manage_users(): void
    {
        $patient = $this->createUser('patient@example.com', 'PATIENT');
        $this->actingAs($patient, 'sanctum');

        $this->getJson('/api/utilisateurs')->assertForbidden();
        $this->postJson('/api/utilisateurs', [])->assertForbidden();
    }

    private function createUser(string $email, string $role): Utilisateur
    {
        return Utilisateur::create([
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => $email,
            'password' => Hash::make('secret123'),
            'role' => $role,
            'statut' => 'ACTIF',
        ]);
    }
}