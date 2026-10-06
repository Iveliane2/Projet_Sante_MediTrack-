<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('traitements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnostic_id')->constrained('diagnostics')->cascadeOnDelete();
            $table->string('medicament')->nullable();
            $table->string('posologie')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->enum('statut', ['EN_COURS', 'TERMINE', 'SUSPENDU'])->default('EN_COURS');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('traitements');
    }
};
