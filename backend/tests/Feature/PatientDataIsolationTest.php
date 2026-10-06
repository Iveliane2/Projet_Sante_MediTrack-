<?php

namespace Tests\Feature;

use App\Models\Diagnostic;
use App\Models\DossierMedical;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\RendezVous;
use App\Models\Traitement;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientDataIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_only_receives_and_opens_their_own_clinical_records(): void
    {
        $patientUser = $this->createUser('patient-one@example.com', 'PATIENT');
        $otherPatientUser = $this->createUser('patient-two@example.com', 'PATIENT');
        $doctorUser = $this->createUser('doctor@example.com', 'MEDECIN');

        $patient = Patient::create([
            'utilisateur_id' => $patientUser->id,
            'numero_dossier' => 'HGL-TEST-001',
        ]);
        $otherPatient = Patient::create([
            'utilisateur_id' => $otherPatientUser->id,
            'numero_dossier' => 'HGL-TEST-002',
        ]);
        $doctor = (new Medecin())->forceFill(['utilisateur_id' => $doctorUser->id]);
        $doctor->save();

        $dossier = DossierMedical::create(['patient_id' => $patient->id]);
        $otherDossier = DossierMedical::create(['patient_id' => $otherPatient->id]);
        $diagnostic = Diagnostic::create([
            'dossier_medical_id' => $dossier->id,
            'medecin_id' => $doctor->id,
            'conclusion' => 'Suivi HTA propre au premier patient',
        ]);
        $otherDiagnostic = Diagnostic::create([
            'dossier_medical_id' => $otherDossier->id,
            'medecin_id' => $doctor->id,
            'conclusion' => 'Donnée confidentielle du second patient',
        ]);
        $appointment = RendezVous::create([
            'patient_id' => $patient->id,
            'medecin_id' => $doctor->id,
            'date_heure' => now()->addDay(),
            'motif' => 'Suivi patient un',
        ]);
        $otherAppointment = RendezVous::create([
            'patient_id' => $otherPatient->id,
            'medecin_id' => $doctor->id,
            'date_heure' => now()->addDays(2),
            'motif' => 'Donnée confidentielle du second patient',
        ]);
        $treatment = Traitement::create([
            'diagnostic_id' => $diagnostic->id,
            'medicament' => 'Traitement patient un',
        ]);
        $otherTreatment = Traitement::create([
            'diagnostic_id' => $otherDiagnostic->id,
            'medicament' => 'Traitement confidentiel du second patient',
        ]);

        $this->actingAs($patientUser, 'sanctum');

        $this->getJson("/api/patients/{$patient->id}")->assertOk();
        $this->getJson("/api/patients/{$otherPatient->id}")->assertNotFound();
        $this->getJson('/api/dossiers-medical')
            ->assertOk()
            ->assertJsonFragment(['id' => $dossier->id])
            ->assertJsonMissing(['id' => $otherDossier->id]);
        $this->getJson("/api/dossiers-medical/{$dossier->id}")->assertOk();
        $this->getJson("/api/dossiers-medical/{$otherDossier->id}")->assertNotFound();

        $this->getJson('/api/rendezvous')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $appointment->id])
            ->assertJsonMissing(['id' => $otherAppointment->id]);

        $this->getJson('/api/diagnostics')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $diagnostic->id])
            ->assertJsonMissing(['id' => $otherDiagnostic->id]);

        $this->getJson('/api/traitements')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $treatment->id])
            ->assertJsonMissing(['id' => $otherTreatment->id]);

        $this->getJson("/api/rendezvous/{$otherAppointment->id}")->assertNotFound();
        $this->getJson("/api/diagnostics/{$otherDiagnostic->id}")->assertNotFound();
        $this->getJson("/api/traitements/{$otherTreatment->id}")->assertNotFound();
    }

    private function createUser(string $email, string $role): Utilisateur
    {
        return Utilisateur::create([
            'nom' => 'Test',
            'prenom' => 'Patient',
            'email' => $email,
            'password' => bcrypt('password123'),
            'role' => $role,
            'statut' => 'ACTIF',
        ]);
    }
}