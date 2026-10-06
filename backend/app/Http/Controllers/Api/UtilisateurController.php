<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UtilisateurController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        return Utilisateur::query()
            ->select(['id', 'nom', 'prenom', 'email', 'telephone', 'role', 'statut', 'created_at'])
            ->orderBy('role')
            ->orderBy('nom')
            ->get();
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:utilisateurs,email'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['PATIENT', 'MEDECIN', 'INFIRMIER', 'ADMIN'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['statut'] = 'ACTIF';

        return response()->json(Utilisateur::create($validated), 201);
    }

    public function update(Request $request, Utilisateur $utilisateur)
    {
        $this->authorizeAdmin($request);
        $validated = $request->validate([
            'nom' => ['sometimes', 'required', 'string', 'max:255'],
            'prenom' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('utilisateurs', 'email')->ignore($utilisateur->id)],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'langue_preferee' => ['sometimes', 'required', 'in:FRANCAIS,ANGLAIS,LINGALA,KIKONGO'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role' => ['sometimes', 'required', Rule::in(['PATIENT', 'MEDECIN', 'INFIRMIER', 'ADMIN'])],
            'statut' => ['sometimes', 'required', Rule::in(['ACTIF', 'INACTIF'])],
        ]);

        abort_if(
            $request->user()->id === $utilisateur->id
                && (($validated['role'] ?? $utilisateur->role) !== 'ADMIN'
                    || ($validated['statut'] ?? $utilisateur->statut) !== 'ACTIF'),
            422,
            'Vous ne pouvez pas désactiver ou rétrograder votre propre compte.',
        );

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $utilisateur->update($validated);

        return $utilisateur->fresh();
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->role === 'ADMIN', 403);
    }
}