<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_can_be_rendered(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('tasks/index')
            ->has('tasks')
        );
    }

    public function test_task_can_be_created(): void
    {
        $response = $this->post(route('tasks.store'), [
            'title' => 'Membeli susu dan roti',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'title' => 'Membeli susu dan roti',
            'is_completed' => false,
        ]);
    }

    public function test_task_title_cannot_be_empty_or_only_whitespace(): void
    {
        $response = $this->post(route('tasks.store'), [
            'title' => '   ',
        ]);

        $response->assertSessionHasErrors('title');
        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_task_title_cannot_exceed_255_characters(): void
    {
        $response = $this->post(route('tasks.store'), [
            'title' => str_repeat('a', 256),
        ]);

        $response->assertSessionHasErrors('title');
        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_task_status_can_be_toggled(): void
    {
        $task = Task::create([
            'title' => 'Tugas awal',
            'is_completed' => false,
        ]);

        $response = $this->patch(route('tasks.toggle', $task));

        $response->assertRedirect();
        $this->assertTrue($task->fresh()->is_completed);

        $responseAgain = $this->patch(route('tasks.toggle', $task));
        $responseAgain->assertRedirect();
        $this->assertFalse($task->fresh()->is_completed);
    }

    public function test_tasks_are_ordered_newest_first(): void
    {
        $this->travelTo(now()->subMinutes(10));
        $oldTask = Task::create([
            'title' => 'Tugas Lama',
        ]);

        $this->travelBack();
        $newTask = Task::create([
            'title' => 'Tugas Baru',
        ]);

        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('tasks/index')
            ->has('tasks', 2)
            ->where('tasks.0.id', $newTask->id)
            ->where('tasks.1.id', $oldTask->id)
        );
    }

    public function test_task_can_be_deleted(): void
    {
        $task = Task::create([
            'title' => 'Tugas yang akan dihapus',
        ]);

        $response = $this->delete(route('tasks.destroy', $task));

        $response->assertRedirect();
        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    public function test_tasks_can_be_reordered(): void
    {
        $task1 = Task::create(['title' => 'Tugas 1', 'position' => 1]);
        $task2 = Task::create(['title' => 'Tugas 2', 'position' => 2]);
        $task3 = Task::create(['title' => 'Tugas 3', 'position' => 3]);

        $response = $this->patch(route('tasks.reorder'), [
            'ids' => [$task3->id, $task1->id, $task2->id],
        ]);

        $response->assertRedirect();
        $this->assertEquals(1, $task3->fresh()->position);
        $this->assertEquals(2, $task1->fresh()->position);
        $this->assertEquals(3, $task2->fresh()->position);

        $responseIndex = $this->get(route('home'));
        $responseIndex->assertInertia(fn (Assert $page) => $page
            ->where('tasks.0.id', $task3->id)
            ->where('tasks.1.id', $task1->id)
            ->where('tasks.2.id', $task2->id)
        );
    }
}
