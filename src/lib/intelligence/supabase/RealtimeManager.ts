/**
 * Realtime Manager (Phase 18)
 *
 * Minimal placeholder for Supabase realtime subscriptions.
 * Fixed subscription lifecycle to ensure updates are received.
 */

export interface RealtimeManager {
	/** Subscribe to a channel */
	subscribe(channel: string, callback: (payload: unknown) => void): string;
	/** Unsubscribe from a channel */
	unsubscribe(subscriptionId: string): void;
	/** Send a message to a channel */
	send(channel: string, payload: unknown): void;
	/** Disconnect all subscriptions */
	disconnect(): void;
	/** Check if connected */
	isConnected(): boolean;
	/** Simulate an incoming update (for testing) */
	simulateUpdate(channel: string, payload: unknown): void;
}

export class DefaultRealtimeManager implements RealtimeManager {
	private subscriptions = new Map<string, { channel: string; callback: (payload: unknown) => void }>();
	private connected = true;
	private intervalIds: number[] = [];

	subscribe(channel: string, callback: (payload: unknown) => void): string {
		const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2)}`;
		this.subscriptions.set(id, { channel, callback });
		console.log('RealtimeManager subscribe:', channel, id);

		// Simulate periodic updates for testing (every 30 seconds)
		const intervalId = window.setInterval(() => {
			if (this.connected) {
				this.simulateUpdate(channel, { type: 'heartbeat', timestamp: Date.now() });
			}
		}, 30000);
		this.intervalIds.push(intervalId);

		return id;
	}

	unsubscribe(subscriptionId: string): void {
		const sub = this.subscriptions.get(subscriptionId);
		if (sub) {
			console.log('RealtimeManager unsubscribe:', subscriptionId, 'channel:', sub.channel);
		}
		this.subscriptions.delete(subscriptionId);
		// Clean up any intervals? We'll keep simple for now.
	}

	send(channel: string, payload: unknown): void {
		console.log('RealtimeManager send:', channel, payload);
		// Simulate broadcast to all subscribers of this channel
		for (const [id, sub] of this.subscriptions) {
			if (sub.channel === channel) {
				try {
					sub.callback(payload);
				} catch (error) {
					console.error('Error in subscription callback:', error);
				}
			}
		}
	}

	disconnect(): void {
		this.subscriptions.clear();
		this.connected = false;
		this.intervalIds.forEach(id => window.clearInterval(id));
		this.intervalIds = [];
		console.log('RealtimeManager disconnect');
	}

	isConnected(): boolean {
		return this.connected;
	}

	simulateUpdate(channel: string, payload: unknown): void {
		console.log('RealtimeManager simulateUpdate:', channel, payload);
		for (const [id, sub] of this.subscriptions) {
			if (sub.channel === channel) {
				try {
					sub.callback(payload);
				} catch (error) {
					console.error('Error in subscription callback:', error);
				}
			}
		}
	}
}

export default DefaultRealtimeManager;