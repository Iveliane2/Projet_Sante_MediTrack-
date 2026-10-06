<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_token_for_valid_credentials(): void
    {
        Utilisateur::create([
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'auth@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'PATIENT',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'auth@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_authenticated_user_can_update_language_and_change_password(): void
    {
        $user = Utilisateur::create([
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'profile@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'PATIENT',
        ]);
        $this->actingAs($user, 'sanctum');

        $this->putJson('/api/profil', ['langue_preferee' => 'LINGALA'])
            ->assertOk()
            ->assertJsonPath('langue_preferee', 'LINGALA');

        $this->postJson('/api/profil/mot-de-passe', [
            'current_password' => 'secret123',
            'password' => 'new-secret-123',
            'password_confirmation' => 'new-secret-123',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-secret-123', $user->fresh()->password));
    }
}
