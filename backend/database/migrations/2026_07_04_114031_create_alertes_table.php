<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('constante_medicale_id')->constrained('constante_medicales')->cascadeOnDelete();
            $table->string('type_alerte')->nullable();
            $table->text('message')->nullable();
            $table->enum('niveau', ['FAIBLE', 'MOYEN', 'CRITIQUE'])->nullable();
            $table->timestamp('date_alerte')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
