<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('constante_medicales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_medical_id')->constrained('dossier_medicals')->cascadeOnDelete();
            $table->string('tension_arterielle')->nullable();
            $table->decimal('glycemie', 5, 2)->nullable();
            $table->decimal('poids', 5, 2)->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->timestamp('date_mesure')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('constante_medicales');
    }
};
