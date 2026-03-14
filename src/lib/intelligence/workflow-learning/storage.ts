/**
 * Storage for Workflow Profiles
 * 
 * Persists workflow profiles to workspace/workflow‑profiles.json.
 */


import fs from 'fs/promises';
import path from 'path';
import type { WorkflowProfile } from './WorkflowProfile';

const STORAGE_PATH = './workflow-profiles.json';

export interface StoredWorkflowProfile {
	id: string;
	profile: WorkflowProfile;
	version: number;
	timestamps: {
		stored: Date;
	};
}

/**
 * Load all stored workflow profiles.
 */
export async function loadWorkflowProfiles(): Promise<StoredWorkflowProfile[]> {
	try {
		const data = await fs.readFile(STORAGE_PATH, 'utf-8');
		const parsed = JSON.parse(data);
		// Convert date strings back to Date objects
		return parsed.map((item: any) => ({
			...item,
			profile: {
				...item.profile,
				timestamps: {
					created: new Date(item.profile.timestamps.created),
					updated: new Date(item.profile.timestamps.updated),
					lastObserved: new Date(item.profile.timestamps.lastObserved),
				},
			},
			timestamps: {
				stored: new Date(item.timestamps.stored),
			},
		}));
	} catch (error) {
		// File doesn't exist or is invalid; return empty array
		return [];
	}
}

/**
 * Save a workflow profile.
 */
export async function saveWorkflowProfile(profile: WorkflowProfile): Promise<StoredWorkflowProfile> {
	const storedProfiles = await loadWorkflowProfiles();
	const storedProfile: StoredWorkflowProfile = {
		id: profile.id,
		profile,
		version: profile.version,
		timestamps: {
			stored: new Date(),
		},
	};

	// Replace existing or add new
	const index = storedProfiles.findIndex(p => p.id === profile.id);
	if (index >= 0) {
		storedProfiles[index] = storedProfile;
	} else {
		storedProfiles.push(storedProfile);
	}

	await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
	await fs.writeFile(STORAGE_PATH, JSON.stringify(storedProfiles, null, 2), 'utf-8');
	return storedProfile;
}

/**
 * Delete a workflow profile by ID.
 */
export async function deleteWorkflowProfile(profileId: string): Promise<boolean> {
	const storedProfiles = await loadWorkflowProfiles();
	const filtered = storedProfiles.filter(p => p.id !== profileId);
	if (filtered.length === storedProfiles.length) {
		return false; // No profile deleted
	}
	await fs.writeFile(STORAGE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
	return true;
}

/**
 * Get workflow profiles for a specific user.
 */
export async function getWorkflowProfilesForUser(userId: string): Promise<WorkflowProfile[]> {
	const storedProfiles = await loadWorkflowProfiles();
	return storedProfiles
		.filter(sp => sp.profile.userId === userId)
		.map(sp => sp.profile);
}

/**
 * Get workflow profiles for a specific report type.
 */
export async function getWorkflowProfilesForReportType(reportTypeId: string): Promise<WorkflowProfile[]> {
	const storedProfiles = await loadWorkflowProfiles();
	return storedProfiles
		.filter(sp => sp.profile.reportTypeId === reportTypeId)
		.map(sp => sp.profile);
}