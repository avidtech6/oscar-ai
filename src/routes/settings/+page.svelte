<script lang="ts">
	import { page } from '$app/stores';

	let darkMode = false;
	let notifications = true;
	let autoSave = true;
	let language = 'en';
	let fontSize = 'medium';

	let profile = {
		name: 'Arborist User',
		email: 'arborist@example.com',
		role: 'Tree Surveyor',
		avatar: '🌳'
	};

	function saveSettings() {
		console.log('Settings saved:', { darkMode, notifications, autoSave, language, fontSize });
		alert('Settings saved successfully!');
	}
</script>

<div class="page">
	<h1>Settings</h1>
	<p class="subtitle">Configure your Oscar AI application preferences.</p>

	<div class="content-grid">
		<div class="card">
			<h2>👤 Profile</h2>
			<div class="profile-section">
				<div class="avatar-large">{profile.avatar}</div>
				<div class="profile-details">
					<div class="profile-name">{profile.name}</div>
					<div class="profile-email">{profile.email}</div>
					<div class="profile-role">{profile.role}</div>
				</div>
			</div>
			<div class="form-group">
				<label for="name">Display Name</label>
				<input id="name" type="text" value={profile.name} />
			</div>
			<div class="form-group">
				<label for="email">Email Address</label>
				<input id="email" type="email" value={profile.email} />
			</div>
			<button class="btn" onclick={() => console.log('Update profile')}>Update Profile</button>
		</div>

		<div class="card">
			<h2>⚙️ General</h2>
			<div class="setting">
				<div class="setting-label">
					<strong>Dark Mode</strong>
					<p>Switch between light and dark themes.</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={darkMode} />
					<span class="slider"></span>
				</label>
			</div>
			<div class="setting">
				<div class="setting-label">
					<strong>Notifications</strong>
					<p>Receive alerts for new reports and tasks.</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={notifications} />
					<span class="slider"></span>
				</label>
			</div>
			<div class="setting">
				<div class="setting-label">
					<strong>Auto‑save</strong>
					<p>Automatically save changes as you work.</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={autoSave} />
					<span class="slider"></span>
				</label>
			</div>
			<div class="form-group">
				<label for="language">Language</label>
				<select id="language" bind:value={language}>
					<option value="en">English</option>
					<option value="es">Español</option>
					<option value="fr">Français</option>
					<option value="de">Deutsch</option>
				</select>
			</div>
			<div class="form-group">
				<label for="fontSize">Font Size</label>
				<select id="fontSize" bind:value={fontSize}>
					<option value="small">Small</option>
					<option value="medium">Medium</option>
					<option value="large">Large</option>
				</select>
			</div>
		</div>

		<div class="card">
			<h2>🔒 Security</h2>
			<div class="security-item">
				<div class="security-icon">🔐</div>
				<div class="security-details">
					<div class="security-title">PIN Authentication</div>
					<div class="security-description">Change your PIN for unlocking the app.</div>
				</div>
				<button class="btn-small" onclick={() => console.log('Change PIN')}>Change</button>
			</div>
			<div class="security-item">
				<div class="security-icon">👁️</div>
				<div class="security-details">
					<div class="security-title">Biometric Login</div>
					<div class="security-description">Use fingerprint or face recognition.</div>
				</div>
				<label class="toggle">
					<input type="checkbox" checked />
					<span class="slider"></span>
				</label>
			</div>
			<div class="security-item">
				<div class="security-icon">🔄</div>
				<div class="security-details">
					<div class="security-title">Recovery Token</div>
					<div class="security-description">Generate a new recovery token.</div>
				</div>
				<button class="btn-small" onclick={() => console.log('Generate token')}>Generate</button>
			</div>
			<div class="security-note">
				<strong>Note:</strong> Security settings are also managed via the unlock and login pages.
			</div>
		</div>

		<div class="card">
			<h2>📊 Data & Storage</h2>
			<div class="storage-info">
				<div class="storage-label">Local Storage</div>
				<div class="storage-bar">
					<div class="storage-fill" style="width: 65%"></div>
				</div>
				<div class="storage-value">65% used (1.3 GB / 2 GB)</div>
			</div>
			<div class="storage-actions">
				<button class="btn-small" onclick={() => console.log('Clear cache')}>Clear Cache</button>
				<button class="btn-small" onclick={() => console.log('Export data')}>Export Data</button>
				<button class="btn-small btn-danger" onclick={() => console.log('Delete all')}>Delete All</button>
			</div>
			<div class="form-group">
				<label for="sync">Cloud Sync</label>
				<select id="sync">
					<option value="auto">Auto‑sync</option>
					<option value="manual">Manual only</option>
					<option value="off">Off</option>
				</select>
			</div>
			<button class="btn" onclick={saveSettings}>Save All Settings</button>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 2rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}
	.content-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}
	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}
	.card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1.5rem;
	}
	.profile-section {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.avatar-large {
		font-size: 3rem;
	}
	.profile-details {
		flex: 1;
	}
	.profile-name {
		font-weight: 700;
		color: #111827;
		font-size: 1.25rem;
	}
	.profile-email,
	.profile-role {
		color: #6b7280;
		font-size: 0.875rem;
	}
	.form-group {
		margin-bottom: 1.5rem;
	}
	.form-group label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}
	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
	}
	.setting {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.setting-label strong {
		display: block;
		color: #111827;
	}
	.setting-label p {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0.25rem 0 0 0;
	}
	.toggle {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 26px;
	}
	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #d1d5db;
		transition: .4s;
		border-radius: 34px;
	}
	.slider:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: .4s;
		border-radius: 50%;
	}
	input:checked + .slider {
		background-color: #3b82f6;
	}
	input:checked + .slider:before {
		transform: translateX(24px);
	}
	.security-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.security-icon {
		font-size: 1.5rem;
	}
	.security-details {
		flex: 1;
	}
	.security-title {
		font-weight: 600;
		color: #111827;
	}
	.security-description {
		font-size: 0.875rem;
		color: #6b7280;
	}
	.btn-small {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.btn-small.btn-danger {
		background: #ef4444;
	}
	.security-note {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 1.5rem;
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 8px;
	}
	.storage-info {
		margin-bottom: 1.5rem;
	}
	.storage-bar {
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
		margin: 0.5rem 0;
	}
	.storage-fill {
		height: 100%;
		background: #3b82f6;
		border-radius: 4px;
	}
	.storage-value {
		font-size: 0.875rem;
		color: #6b7280;
	}
	.storage-actions {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
		width: 100%;
		margin-top: 1rem;
	}
	.btn:hover {
		background: #2563eb;
	}
</style>