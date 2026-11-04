<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display the to-do list landing page.
     */
    public function index(): Response
    {
        $tasks = Task::query()
            ->orderBy('position', 'asc')
            ->latest('created_at')
            ->latest('id')
            ->get();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Store a new task in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'title' => is_string($request->input('title')) ? trim($request->input('title')) : '',
        ]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ], [
            'title.required' => 'Isi tugas tidak boleh kosong.',
            'title.max' => 'Panjang tugas maksimal 255 karakter.',
        ]);

        Task::query()->increment('position');

        Task::create([
            'title' => $validated['title'],
            'is_completed' => false,
            'position' => 1,
        ]);

        return redirect()->back();
    }

    /**
     * Reorder tasks based on ordered list of IDs.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:tasks,id'],
        ]);

        foreach ($validated['ids'] as $index => $id) {
            Task::where('id', $id)->update(['position' => $index + 1]);
        }

        return redirect()->back();
    }

    /**
     * Toggle the completed status of the specified task.
     */
    public function toggle(Task $task): RedirectResponse
    {
        $task->update([
            'is_completed' => !$task->is_completed,
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();

        return redirect()->back();
    }
}

