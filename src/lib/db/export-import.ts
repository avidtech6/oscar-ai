import { db, type Project, type Tree, type Note, type Photo, type Report } from './index';

export interface OscarExport {
	version: string;
	exportedAt: string;
	project: Project;
	trees: Tree[];
	notes: Note[];
	photos: Array<{
		info: Omit<Photo, 'blob'>;
		data: string; // base64
	}>;
	reports: Array<{
		info: Omit<Report, 'pdfBlob'>;
		data: string; // base64
	}>;
}

export async function exportProject(projectId: string): Promise<void> {
	const project = await db.projects.get(projectId);
	if (!project) throw new Error('Project not found');

	const trees = await db.trees.where('projectId').equals(projectId).toArray();
	const notes = await db.notes.where('projectId').equals(projectId).toArray();
	const photos = await db.photos.where('projectId').equals(projectId).toArray();
	const reports = await db.reports.where('projectId').equals(projectId).toArray();

	// Convert blobs to base64
	const photosData = await Promise.all(
		photos.map(async (photo) => ({
			info: { ...photo, blob: undefined } as Omit<Photo, 'blob'>,
			data: await blobToBase64(photo.blob)
		}))
	);

	const reportsData = await Promise.all(
		reports.map(async (report) => ({
			info: { ...report, pdfBlob: undefined } as Omit<Report, 'pdfBlob'>,
			data: await blobToBase64(report.pdfBlob)
		}))
	);

	const exportData: OscarExport = {
		version: '1.0',
		exportedAt: new Date().toISOString(),
		project: { ...project, id: undefined },
		trees: trees.map(t => ({ ...t, id: undefined })),
		notes: notes.map(n => ({ ...n, id: undefined })),
		photos: photosData,
		reports: reportsData
	};

	const json = JSON.stringify(exportData, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	
	const a = document.createElement('a');
	a.href = url;
	a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.oscar`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export async function importProject(file: File): Promise<string> {
	const text = await file.text();
	const data: OscarExport = JSON.parse(text);

	// Create new project with new ID
	const projectId = crypto.randomUUID();
	const now = new Date();

	await db.projects.add({
		...data.project,
		id: projectId,
		createdAt: now,
		updatedAt: now
	});

	// Import trees
	for (const tree of data.trees) {
		await db.trees.add({
			...tree,
			id: crypto.randomUUID(),
			projectId,
			createdAt: now,
			updatedAt: now
		});
	}

	// Import notes
	for (const note of data.notes) {
		await db.notes.add({
			...note,
			id: crypto.randomUUID(),
			projectId,
			createdAt: now,
			updatedAt: now
		});
	}

	// Import photos
	for (const photo of data.photos) {
		const blob = base64ToBlob(photo.data, photo.info.mimeType);
		await db.photos.add({
			...photo.info,
			id: crypto.randomUUID(),
			projectId,
			blob,
			createdAt: now
		});
	}

	// Import reports
	for (const report of data.reports) {
		const blob = base64ToBlob(report.data, 'application/pdf');
		await db.reports.add({
			...report.info,
			id: crypto.randomUUID(),
			projectId,
			pdfBlob: blob,
			generatedAt: now
		});
	}

	return projectId;
}

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(',')[1]);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

function base64ToBlob(base64: string, mimeType: string): Blob {
	const byteCharacters = atob(base64);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	return new Blob([byteArray], { type: mimeType });
}
