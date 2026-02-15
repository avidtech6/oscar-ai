// Oscar AI - PocketBase Client Service
// This service handles all communication with the PocketBase backend

import PocketBase from 'pocketbase';

// Configure PocketBase URL - will be set from environment
const PB_URL = typeof window !== 'undefined' 
    ? localStorage.getItem('pb_url') || 'http://localhost:8090'
    : 'http://localhost:8090';

export const pb = new PocketBase(PB_URL);

// Current user store
export const currentUser = pb.authStore.model;

// Authentication functions
export async function login(email: string, password: string) {
    await pb.collection('users').authWithPassword(email, password);
    return pb.authStore.model;
}

export async function register(email: string, password: string, passwordConfirm: string) {
    const data = {
        email,
        password,
        passwordConfirm
    };
    const record = await pb.collection('users').create(data);
    // Auto-login after registration
    await pb.collection('users').authWithPassword(email, password);
    return record;
}

export function logout() {
    pb.authStore.clear();
}

export function isAuthenticated(): boolean {
    return pb.authStore.isValid;
}

// User Style Profile functions
export async function getStyleProfile() {
    if (!pb.authStore.isValid) return null;
    const user = pb.authStore.model as any;
    if (!user.styleProfileId) return null;
    return await pb.collection('userStyleProfiles').getOne(user.styleProfileId);
}

export async function updateStyleProfile(data: any) {
    const user = pb.authStore.model as any;
    if (!user.styleProfileId) {
        // Create new style profile
        const profile = await pb.collection('userStyleProfiles').create(data);
        await pb.collection('users').update(user.id, { styleProfileId: profile.id });
        return profile;
    }
    return await pb.collection('userStyleProfiles').update(user.styleProfileId, data);
}

// Project functions
export async function getProjects() {
    const records = await pb.collection('projects').getList(1, 50, {
        sort: '-createdAt'
    });
    return records.items;
}

export async function getProject(id: string) {
    return await pb.collection('projects').getOne(id);
}

export async function createProject(data: any) {
    return await pb.collection('projects').create(data);
}

export async function updateProject(id: string, data: any) {
    return await pb.collection('projects').update(id, data);
}

export async function deleteProject(id: string) {
    // Delete all related trees, notes, photos, etc.
    const trees = await pb.collection('trees').getFullList({
        filter: `projectId = "${id}"`
    });
    for (const tree of trees) {
        await pb.collection('trees').delete(tree.id);
    }
    
    const notes = await pb.collection('notes').getFullList({
        filter: `projectId = "${id}"`
    });
    for (const note of notes) {
        await pb.collection('notes').delete(note.id);
    }
    
    const reports = await pb.collection('reports').getFullList({
        filter: `projectId = "${id}"`
    });
    for (const report of reports) {
        await pb.collection('reports').delete(report.id);
    }
    
    return await pb.collection('projects').delete(id);
}

// Tree functions
export async function getTrees(projectId: string) {
    const records = await pb.collection('trees').getList(1, 1000, {
        filter: `projectId = "${projectId}"`,
        sort: 'number'
    });
    return records.items;
}

export async function createTree(data: any) {
    return await pb.collection('trees').create(data);
}

export async function updateTree(id: string, data: any) {
    return await pb.collection('trees').update(id, data);
}

export async function deleteTree(id: string) {
    return await pb.collection('trees').delete(id);
}

// Note functions
export async function getNotes(projectId: string) {
    const records = await pb.collection('notes').getList(1, 1000, {
        filter: `projectId = "${projectId}"`,
        sort: '-createdAt'
    });
    return records.items;
}

export async function createNote(data: any) {
    return await pb.collection('notes').create(data);
}

export async function updateNote(id: string, data: any) {
    return await pb.collection('notes').update(id, data);
}

export async function deleteNote(id: string) {
    return await pb.collection('notes').delete(id);
}

// Photo functions
export async function uploadPhoto(projectId: string, treeId: string | null, file: File) {
    const formData = new FormData();
    formData.append('projectId', projectId);
    if (treeId) formData.append('treeId', treeId);
    formData.append('file', file);
    return await pb.collection('photos').create(formData);
}

export async function getPhotoUrl(photo: any): string {
    return pb.files.getUrl(photo, photo.file);
}

export async function deletePhoto(id: string) {
    return await pb.collection('photos').delete(id);
}

// Voice Note functions
export async function uploadVoiceNote(projectId: string, treeId: string | null, audioFile: File, transcript: string) {
    const formData = new FormData();
    formData.append('projectId', projectId);
    if (treeId) formData.append('treeId', treeId);
    formData.append('audioFile', audioFile);
    formData.append('transcript', transcript);
    return await pb.collection('voiceNotes').create(formData);
}

export async function getVoiceNoteUrl(voiceNote: any): string {
    return pb.files.getUrl(voiceNote, voiceNote.audioFile);
}

export async function deleteVoiceNote(id: string) {
    return await pb.collection('voiceNotes').delete(id);
}

// Report functions
export async function createReport(projectId: string, type: string, pdfFile: File, htmlSnapshot: string, metadata: any) {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('type', type);
    formData.append('pdfFile', pdfFile);
    formData.append('htmlSnapshot', htmlSnapshot);
    formData.append('metadata', JSON.stringify(metadata));
    return await pb.collection('reports').create(formData);
}

export async function getReportUrl(report: any): string {
    return pb.files.getUrl(report, report.pdfFile);
}

export async function deleteReport(id: string) {
    return await pb.collection('reports').delete(id);
}

// Blog Post functions
export async function getBlogPosts(projectId: string) {
    const records = await pb.collection('blogPosts').getList(1, 100, {
        filter: `projectId = "${projectId}"`,
        sort: '-createdAt'
    });
    return records.items;
}

export async function createBlogPost(data: any) {
    return await pb.collection('blogPosts').create(data);
}

export async function updateBlogPost(id: string, data: any) {
    return await pb.collection('blogPosts').update(id, data);
}

export async function deleteBlogPost(id: string) {
    return await pb.collection('blogPosts').delete(id);
}

// Set PocketBase URL
export function setPocketBaseUrl(url: string) {
    pb.baseURL = url;
    if (typeof window !== 'undefined') {
        localStorage.setItem('pb_url', url);
    }
}
