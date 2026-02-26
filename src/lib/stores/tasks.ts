import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Task {
	id: string;
	title: string;
	priority: 'low' | 'medium' | 'high';
	completed: boolean;
	createdAt: string;
	completedAt?: string;
}

function createTasksStore() {
	const defaultValue: Task[] = [
		{
			id: '1',
			title: 'Review project report',
			priority: 'high',
			completed: false,
			createdAt: new Date(Date.now() - 86400000).toISOString()
		},
		{
			id: '2',
			title: 'Update documentation',
			priority: 'medium',
			completed: true,
			createdAt: new Date(Date.now() - 172800000).toISOString(),
			completedAt: new Date(Date.now() - 86400000).toISOString()
		},
		{
			id: '3',
			title: 'Prepare meeting agenda',
			priority: 'medium',
			completed: false,
			createdAt: new Date().toISOString()
		},
		{
			id: '4',
			title: 'Fix mobile navigation',
			priority: 'high',
			completed: false,
			createdAt: new Date().toISOString()
		}
	];

	const { subscribe, set, update } = writable<Task[]>(defaultValue);

	// Load from localStorage in browser
	if (browser) {
		const stored = localStorage.getItem('tasks');
		if (stored) {
			try {
				set(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse tasks from localStorage', e);
			}
		}
	}

	function saveToStorage(tasks: Task[]) {
		if (browser) {
			localStorage.setItem('tasks', JSON.stringify(tasks));
		}
	}

	function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const newTask = {
			...task,
			id,
			createdAt: new Date().toISOString()
		};
		update(tasks => {
			const updated = [...tasks, newTask];
			saveToStorage(updated);
			return updated;
		});
	}

	function toggleTask(id: string) {
		update(tasks => {
			const updated = tasks.map(task => {
				if (task.id === id) {
					const completed = !task.completed;
					return {
						...task,
						completed,
						completedAt: completed ? new Date().toISOString() : undefined
					};
				}
				return task;
			});
			saveToStorage(updated);
			return updated;
		});
	}

	function deleteTask(id: string) {
		update(tasks => {
			const updated = tasks.filter(task => task.id !== id);
			saveToStorage(updated);
			return updated;
		});
	}

	function updateTask(id: string, updates: Partial<Task>) {
		update(tasks => {
			const updated = tasks.map(task => task.id === id ? { ...task, ...updates } : task);
			saveToStorage(updated);
			return updated;
		});
	}

	return {
		subscribe,
		addTask,
		toggleTask,
		deleteTask,
		updateTask,
		reset: () => {
			set(defaultValue);
			saveToStorage(defaultValue);
		}
	};
}

export const tasksStore = createTasksStore();