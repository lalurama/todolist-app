import { Head, useForm, router } from '@inertiajs/react';
import {
    Sun,
    Moon,
    Check,
    Plus,
    Loader2,
    Trash2,
    GripVertical,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAppearance } from '@/hooks/use-appearance';
import type { Task } from '@/types/task';

interface TasksPageProps {
    tasks: Task[];
}

export default function TasksIndex({ tasks }: TasksPageProps) {
    const { updateAppearance } = useAppearance();
    const inputRef = useRef<HTMLInputElement>(null);

    const [taskList, setTaskList] = useState<Task[]>(tasks);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    // Drag-and-drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Sync taskList with incoming server props
    useEffect(() => {
        setTaskList(tasks);
    }, [tasks]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
    });

    const pendingTasksCount = taskList.filter((task) => !task.is_completed).length;
    const completedTasksCount = taskList.filter((task) => task.is_completed).length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = data.title.trim();
        if (!trimmed) {
            return;
        }

        post('/tasks', {
            preserveScroll: true,
            onSuccess: () => {
                reset('title');
                inputRef.current?.focus();
            },
        });
    };

    const handleToggle = (taskId: number) => {
        setTogglingId(taskId);
        router.patch(
            `/tasks/${taskId}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    const handleConfirmDelete = () => {
        if (!taskToDelete) {
            return;
        }

        const idToDelete = taskToDelete.id;
        setDeletingId(idToDelete);

        router.delete(`/tasks/${idToDelete}`, {
            preserveScroll: true,
            onSuccess: () => {
                setTaskToDelete(null);
            },
            onFinish: () => {
                setDeletingId(null);
            },
        });
    };

    const reorderList = (fromIndex: number, toIndex: number) => {
        if (
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= taskList.length ||
            toIndex >= taskList.length
        ) {
            return;
        }

        const updated = [...taskList];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);

        // Optimistic UI update
        setTaskList(updated);

        // Persist new order to server
        setIsReordering(true);
        router.patch(
            '/tasks/reorder',
            { ids: updated.map((t) => t.id) },
            {
                preserveScroll: true,
                onFinish: () => setIsReordering(false),
                onError: () => {
                    // Revert in case of an error
                    setTaskList(tasks);
                },
            },
        );
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        const target = e.target as HTMLElement;
        // Do not trigger drag if clicking an interactive control
        if (target.closest('button') || target.closest('input')) {
            e.preventDefault();
            return;
        }

        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        reorderList(draggedIndex, dropIndex);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(date);
        } catch {
            return '';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
            <Head title="To-Do List Sederhana" />

            <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-16 flex-1 flex flex-col">
                {/* Header Section */}
                <header className="flex items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            Daftar Tugas
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Catat, susun urutan, dan selesaikan tugas harian Anda secara teratur.
                        </p>
                    </div>

                    {/* Theme Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Ubah mode tema tampilan"
                        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 transition-all cursor-pointer"
                    >
                        <Sun className="size-5 hidden dark:block" aria-hidden="true" />
                        <Moon className="size-5 block dark:hidden" aria-hidden="true" />
                    </button>
                </header>

                <main className="flex-1 flex flex-col">
                    {/* Input Form Section */}
                    <section aria-labelledby="form-heading" className="mb-8">
                        <h2 id="form-heading" className="sr-only">
                            Tambah Tugas Baru
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                            <div className="flex-1">
                                <label htmlFor="task-title-input" className="sr-only">
                                    Tulis tugas baru
                                </label>
                                <input
                                    ref={inputRef}
                                    id="task-title-input"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => {
                                        clearErrors('title');
                                        setData('title', e.target.value);
                                    }}
                                    maxLength={255}
                                    placeholder="Tulis tugas baru di sini..."
                                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 transition-all shadow-xs"
                                    disabled={processing}
                                />
                                {errors.title && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.title.trim()}
                                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:active:bg-white dark:text-slate-900 font-medium text-sm sm:text-base transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="size-4" aria-hidden="true" />
                                        <span>Simpan</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    {/* Task Summary */}
                    {taskList.length > 0 && (
                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 px-1">
                            <span>
                                {pendingTasksCount === 0
                                    ? 'Semua tugas telah diselesaikan.'
                                    : `${pendingTasksCount} tugas tersisa`}
                            </span>
                            <span>{completedTasksCount} tugas selesai</span>
                        </div>
                    )}

                    {/* Task List Section */}
                    <section aria-labelledby="tasks-heading" className="flex-1">
                        <h2 id="tasks-heading" className="sr-only">
                            Daftar Tugas
                        </h2>

                        {taskList.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/40 my-4">
                                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                                    Belum ada tugas, mulai tulis di atas.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2.5" role="list">
                                {taskList.map((task, index) => {
                                    const isToggling = togglingId === task.id;
                                    const isDeleting = deletingId === task.id;
                                    const isDragging = draggedIndex === index;
                                    const isDragOver = dragOverIndex === index && draggedIndex !== index;

                                    return (
                                        <li
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`group flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl border transition-all ${
                                                isDragging
                                                    ? 'opacity-40 border-dashed border-slate-400 dark:border-slate-600 scale-[0.99]'
                                                    : isDragOver
                                                      ? 'ring-2 ring-slate-900/20 dark:ring-slate-100/30 border-slate-900 dark:border-slate-100'
                                                      : task.is_completed
                                                        ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                                            }`}
                                        >
                                            {/* Drag Handle */}
                                            <div
                                                title="Tahan dan geser untuk memindahkan posisi"
                                                className="flex items-center justify-center p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded transition-colors"
                                                aria-hidden="true"
                                            >
                                                <GripVertical className="size-4.5" />
                                            </div>

                                            {/* Status Checkbox */}
                                            <button
                                                type="button"
                                                role="checkbox"
                                                aria-checked={task.is_completed}
                                                aria-label={`Tandai tugas "${task.title}" sebagai ${
                                                    task.is_completed ? 'belum selesai' : 'selesai'
                                                }`}
                                                onClick={() => handleToggle(task.id)}
                                                disabled={isToggling}
                                                className={`min-w-[24px] min-h-[24px] rounded-md border flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 ${
                                                    task.is_completed
                                                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
                                                        : 'border-slate-400 dark:border-slate-600 hover:border-slate-700 dark:hover:border-slate-300 bg-transparent'
                                                }`}
                                            >
                                                {isToggling ? (
                                                    <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                                                ) : task.is_completed ? (
                                                    <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                                                ) : null}
                                            </button>

                                            {/* Task Content */}
                                            <div className="flex-1 min-w-0 px-1">
                                                <p
                                                    className={`text-sm sm:text-base break-words transition-all ${
                                                        task.is_completed
                                                            ? 'line-through text-slate-500 dark:text-slate-400'
                                                            : 'text-slate-900 dark:text-slate-100'
                                                    }`}
                                                >
                                                    {task.title}
                                                </p>
                                                {task.created_at && (
                                                    <time
                                                        dateTime={task.created_at}
                                                        suppressHydrationWarning
                                                        className="block mt-0.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500"
                                                    >
                                                        {formatDate(task.created_at)}
                                                    </time>
                                                )}
                                            </div>

                                            {/* Action Buttons: Move Up/Down & Delete */}
                                            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                                {/* Reorder Buttons (Keyboard & Touch friendly) */}
                                                <button
                                                    type="button"
                                                    disabled={index === 0 || isReordering}
                                                    onClick={() => reorderList(index, index - 1)}
                                                    aria-label={`Pindahkan tugas "${task.title}" ke atas`}
                                                    title="Pindahkan ke atas"
                                                    className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                                                >
                                                    <ChevronUp className="size-4" aria-hidden="true" />
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={index === taskList.length - 1 || isReordering}
                                                    onClick={() => reorderList(index, index + 1)}
                                                    aria-label={`Pindahkan tugas "${task.title}" ke bawah`}
                                                    title="Pindahkan ke bawah"
                                                    className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                                                >
                                                    <ChevronDown className="size-4" aria-hidden="true" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setTaskToDelete(task)}
                                                    disabled={isDeleting}
                                                    aria-label={`Hapus tugas "${task.title}"`}
                                                    title="Hapus tugas"
                                                    className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="size-4 animate-spin text-red-600" aria-hidden="true" />
                                                    ) : (
                                                        <Trash2 className="size-4" aria-hidden="true" />
                                                    )}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </main>

                <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-500">
                    <p>Aplikasi To-Do List Sederhana.</p>
                </footer>
            </div>

            {/* Confirmation Dialog for Deleting Task */}
            <Dialog
                open={taskToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deletingId) {
                        setTaskToDelete(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                            Hapus Tugas
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            Apakah Anda yakin ingin menghapus tugas{' '}
                            <strong className="text-slate-900 dark:text-slate-200">
                                "{taskToDelete?.title}"
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => setTaskToDelete(null)}
                            disabled={deletingId !== null}
                            className="min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={deletingId !== null}
                            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                            {deletingId !== null ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                    <span>Menghapus...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-4" aria-hidden="true" />
                                    <span>Hapus</span>
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
