/**
 * Gallery Database (IndexedDB) for media storage
 */
import type { MediaItem, GalleryQuery, MediaType, MediaContext } from './MediaTypes';

const DB_NAME = 'oscar-media-gallery';
const DB_VERSION = 1;
const STORE_NAME = 'media';

export class GalleryDB {
  private db: IDBDatabase | null = null;
  private ready: Promise<void>;

  constructor() {
    // Check if we're in a browser environment before initializing
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      this.ready = Promise.resolve();
      return;
    }
    
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          store.createIndex('page', 'context.page', { unique: false });
          store.createIndex('itemId', 'context.itemId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  }

  async waitForReady(): Promise<void> {
    await this.ready;
  }

  async addMedia(media: MediaItem): Promise<string> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(media);

      request.onsuccess = () => resolve(media.id);
      request.onerror = () => reject(new Error('Failed to add media'));
    });
  }

  async getMedia(id: string): Promise<MediaItem | null> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get media'));
    });
  }

  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<void> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Media not found'));
          return;
        }
        const updated = { ...existing, ...updates, updatedAt: Date.now() };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update media'));
      };
      getRequest.onerror = () => reject(new Error('Failed to fetch media for update'));
    });
  }

  async deleteMedia(id: string): Promise<void> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete media'));
    });
  }

  async queryMedia(query: GalleryQuery): Promise<MediaItem[]> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      let index: IDBIndex | null = null;
      let range: IDBKeyRange | null = null;

      // Determine which index to use
      if (query.type) {
        index = store.index('type');
        range = IDBKeyRange.only(query.type);
      } else if (query.page) {
        index = store.index('page');
        range = IDBKeyRange.only(query.page);
      } else if (query.itemId) {
        index = store.index('itemId');
        range = IDBKeyRange.only(query.itemId);
      } else if (query.fromDate || query.toDate) {
        index = store.index('createdAt');
        const lower = query.fromDate || 0;
        const upper = query.toDate || Number.MAX_SAFE_INTEGER;
        range = IDBKeyRange.bound(lower, upper);
      }

      const request = index ? index.openCursor(range) : store.openCursor();
      const results: MediaItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const item = cursor.value as MediaItem;
          // Filter by tags if provided
          if (query.tags && query.tags.length > 0) {
            const hasAllTags = query.tags.every(tag => item.context.tags.includes(tag));
            if (hasAllTags) results.push(item);
          } else {
            results.push(item);
          }
          cursor.continue();
        } else {
          // Apply limit/offset
          let filtered = results;
          if (query.offset) filtered = filtered.slice(query.offset);
          if (query.limit) filtered = filtered.slice(0, query.limit);
          resolve(filtered);
        }
      };

      request.onerror = () => reject(new Error('Query failed'));
    });
  }

  async count(query?: Omit<GalleryQuery, 'limit' | 'offset'>): Promise<number> {
    const items = await this.queryMedia({ ...query, limit: undefined, offset: undefined });
    return items.length;
  }

  async clear(): Promise<void> {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear gallery'));
    });
  }
}

// Singleton instance
export const galleryDB = new GalleryDB();