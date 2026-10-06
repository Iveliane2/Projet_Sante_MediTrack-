<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|min:6',
            'role' => 'nullable|in:PATIENT',
        ]);

        $utilisateur = Utilisateur::create([
            ...$validated,
            'role' => 'PATIENT',
            'statut' => 'ACTIF',
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Compte créé avec succès',
            'user' => $utilisateur,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $utilisateur = Utilisateur::where('email', $validated['email'])->first();

        if (! $utilisateur || ! Hash::check($validated['password'], $utilisateur->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $token = $utilisateur->createToken('mobile')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $utilisateur,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'telephone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'langue_preferee' => ['sometimes', 'required', 'in:FRANCAIS,ANGLAIS,LINGALA,KIKONGO'],
        ]);

        $request->user()->update($validated);

        return response()->json($request->user()->fresh());
    }
}
