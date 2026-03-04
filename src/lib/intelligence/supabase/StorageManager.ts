/**
 * Storage Manager (Phase 18)
 * 
 * Minimal placeholder for Supabase storage manager.
 */

export interface StorageManager {
	/** Upload a file */
	upload(file: File, path: string): Promise<string>;
	/** Download a file */
	download(path: string): Promise<Blob>;
	/** Delete a file */
	delete(path: string): Promise<void>;
	/** List files in a bucket */
	list(bucket: string, prefix?: string): Promise<string[]>;
	/** Get public URL */
	getPublicUrl(path: string): string;
}

export class DefaultStorageManager implements StorageManager {
	async upload(file: File, path: string): Promise<string> {
		console.log('StorageManager upload:', file.name, path);
		return `https://example.com/storage/${path}`;
	}

	async download(path: string): Promise<Blob> {
		console.log('StorageManager download:', path);
		return new Blob(['placeholder']);
	}

	async delete(path: string): Promise<void> {
		console.log('StorageManager delete:', path);
	}

	async list(bucket: string, prefix?: string): Promise<string[]> {
		console.log('StorageManager list:', bucket, prefix);
		return ['file1.txt', 'file2.pdf'];
	}

	getPublicUrl(path: string): string {
		return `https://example.com/storage/${path}`;
	}
}

export default DefaultStorageManager;