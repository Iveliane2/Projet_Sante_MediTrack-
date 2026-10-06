<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PatientRecordScope
{
    public static function apply(Builder $query, Request $request, string $patientRelation): Builder
    {
        if ($request->user()->role !== 'PATIENT') {
            return $query;
        }

        return $query->whereHas(
            $patientRelation,
            fn (Builder $patientQuery) => $patientQuery->where('utilisateur_id', $request->user()->id),
        );
    }

    public static function authorizeProfessionalMutation(Request $request, array $roles): void
    {
        abort_unless(in_array($request->user()->role, $roles, true), 403);
    }
}