// Oscar AI - Hybrid Backend Service
// Works with PocketBase when available, falls back to IndexedDB

import { pb, setPocketBaseUrl, isAuthenticated as pbIsAuthenticated, login as pbLogin, register as pbRegister, logout as pbLogout } from './pocketbase';
import { db } from '../db';

// Configuration
let usePocketBase = false;
let pocketBaseUrl = '';

// Initialize backend service
export async function initializeBackend() {
    // Check if PocketBase URL is configured
    const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('pb_url') : null;
    
    if (storedUrl) {
        try {
            setPocketBaseUrl(storedUrl);
            // Test connection
            await pb.collection('_').getList(1, 1);
            usePocketBase = true;
            pocketBaseUrl = storedUrl;
            console.log('Connected to PocketBase:', storedUrl);
            return { success: true, backend: 'pocketbase', url: storedUrl };
        } catch (e) {
            console.log('PocketBase not available, using local storage');
            usePocketBase = false;
        }
    }
    
    console.log('Using local IndexedDB storage');
    return { success: true, backend: 'local', url: null };
}

// Configure PocketBase URL
export function configurePocketBase(url: string) {
    pocketBaseUrl = url;
    setPocketBaseUrl(url);
    localStorage.setItem('pb_url', url);
    usePocketBase = true;
}

// Get current backend type
export function getBackendType(): 'pocketbase' | 'local' {
    return usePocketBase ? 'pocketbase' : 'local';
}

// Auth wrapper
export async function login(email: string, password: string) {
    if (usePocketBase) {
        return await pbLogin(email, password);
    }
    // Local auth - simplified for dev
    const storedKey = localStorage.getItem('oscar_groq_api_key');
    if (storedKey) {
        return { email, id: 'local-user' };
    }
    throw new Error('Please configure the app in Settings first');
}

export async function register(email: string, password: string, passwordConfirm: string) {
    if (usePocketBase) {
        return await pbRegister(email, password, passwordConfirm);
    }
    throw new Error('Registration not available in local mode');
}

export function logout() {
    if (usePocketBase) {
        pbLogout();
    }
}

export function isAuthenticated(): boolean {
    if (usePocketBase) {
        return pbIsAuthenticated();
    }
    // Local mode - always authenticated in dev
    return true;
}

// Projects wrapper
export async function getProjects() {
    if (usePocketBase) {
        const { getProjects: pbGetProjects } = await import('./pocketbase');
        return await pbGetProjects();
    }
    return await db.projects.toArray();
}

export async function getProject(id: string) {
    if (usePocketBase) {
        const { getProject: pbGetProject } = await import('./pocketbase');
        return await pbGetProject(id);
    }
    return await db.projects.get(id);
}

export async function createProject(data: any) {
    if (usePocketBase) {
        const { createProject: pbCreateProject } = await import('./pocketbase');
        return await pbCreateProject(data);
    }
    const id = await db.projects.add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return { id, ...data };
}

export async function updateProject(id: string, data: any) {
    if (usePocketBase) {
        const { updateProject: pbUpdateProject } = await import('./pocketbase');
        return await pbUpdateProject(id, data);
    }
    await db.projects.update(id, { ...data, updatedAt: new Date() });
    return await db.projects.get(id);
}

export async function deleteProject(id: string) {
    if (usePocketBase) {
        const { deleteProject: pbDeleteProject } = await import('./pocketbase');
        return await pbDeleteProject(id);
    }
    // Delete related data
    const trees = await db.trees.where('projectId').equals(id).toArray();
    for (const tree of trees) {
        await db.trees.delete(tree.id!);
    }
    const notes = await db.notes.where('projectId').equals(id).toArray();
    for (const note of notes) {
        await db.notes.delete(note.id!);
    }
    return await db.projects.delete(id);
}

// Trees wrapper
export async function getTrees(projectId: string) {
    if (usePocketBase) {
        const { getTrees: pbGetTrees } = await import('./pocketbase');
        return await pbGetTrees(projectId);
    }
    return await db.trees.where('projectId').equals(projectId).toArray();
}

export async function createTree(data: any) {
    if (usePocketBase) {
        const { createTree: pbCreateTree } = await import('./pocketbase');
        return await pbCreateTree(data);
    }
    const id = await db.trees.add({
        ...data,
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return { id, ...data };
}

export async function updateTree(id: string, data: any) {
    if (usePocketBase) {
        const { updateTree: pbUpdateTree } = await import('./pocketbase');
        return await pbUpdateTree(id, data);
    }
    await db.trees.update(id, { ...data, updatedAt: new Date() });
    return await db.trees.get(id);
}

export async function deleteTree(id: string) {
    if (usePocketBase) {
        const { deleteTree: pbDeleteTree } = await import('./pocketbase');
        return await pbDeleteTree(id);
    }
    return await db.trees.delete(id);
}

// Notes wrapper
export async function getNotes(projectId: string) {
    if (usePocketBase) {
        const { getNotes: pbGetNotes } = await import('./pocketbase');
        return await pbGetNotes(projectId);
    }
    return await db.notes.where('projectId').equals(projectId).toArray();
}

export async function createNote(data: any) {
    if (usePocketBase) {
        const { createNote: pbCreateNote } = await import('./pocketbase');
        return await pbCreateNote(data);
    }
    const id = await db.notes.add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return { id, ...data };
}

export async function deleteNote(id: string) {
    if (usePocketBase) {
        const { deleteNote: pbDeleteNote } = await import('./pocketbase');
        return await pbDeleteNote(id);
    }
    return await db.notes.delete(id);
}

// Get backend URL
export function getPocketBaseUrl(): string | null {
    return pocketBaseUrl || null;
}
