<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('position')->default(0)->after('is_completed');
        });

        // Initialize position for existing tasks based on newest first
        $tasks = \App\Models\Task::query()
            ->latest('created_at')
            ->latest('id')
            ->get();

        foreach ($tasks as $index => $task) {
            $task->update(['position' => $index + 1]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
