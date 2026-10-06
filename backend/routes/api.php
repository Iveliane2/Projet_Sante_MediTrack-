<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConstanteMedicaleController;
use App\Http\Controllers\Api\DiagnosticController;
use App\Http\Controllers\Api\DossierMedicalController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\TraitementController;
use App\Http\Controllers\Api\UtilisateurController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('constantes', ConstanteMedicaleController::class);
    Route::apiResource('utilisateurs', UtilisateurController::class)->only(['index', 'store', 'update']);
    Route::put('profil', [AuthController::class, 'updateProfile']);
    Route::post('profil/mot-de-passe', [AuthController::class, 'updatePassword']);
    Route::apiResource('diagnostics', DiagnosticController::class);
    Route::apiResource('dossiers-medical', DossierMedicalController::class)
        ->parameters(['dossiers-medical' => 'dossierMedical']);
    Route::apiResource('rendezvous', RendezVousController::class);
    Route::apiResource('traitements', TraitementController::class);
});
