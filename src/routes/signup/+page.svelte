<script lang="ts">
	import { goto } from '$app/navigation';
	import { register, initializeBackend } from '$lib/services/backend';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	async function handleRegister() {
		if (!email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		loading = true;
		error = '';

		try {
			await register(email, password, confirmPassword);
			await initializeBackend();
			goto('/dashboard');
		} catch (e: any) {
			error = e.message || 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - Oscar AI</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-forest-800 via-forest-700 to-oak-600 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Logo -->
		<div class="text-center text-white mb-8">
			<div class="text-6xl mb-4">🌳</div>
			<h1 class="text-3xl font-bold">Oscar AI</h1>
			<p class="text-forest-200">Arboricultural Notebook + Assistant</p>
		</div>

		<!-- Signup Form -->
		<div class="bg-white rounded-xl p-6 shadow-xl">
			<h2 class="text-xl font-bold text-gray-900 mb-6">Create Account</h2>
			
			{#if error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
					{error}
				</div>
			{/if}

			<form on:submit|preventDefault={handleRegister} class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						class="input w-full"
						required
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						class="input w-full"
						required
						minlength="8"
					/>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="••••••••"
						class="input w-full"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="btn btn-primary w-full"
				>
					{loading ? 'Creating account...' : 'Create Account'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-gray-600">
					Already have an account?
					<a href="/login" class="text-forest-600 hover:underline font-medium">Sign in</a>
				</p>
			</div>

			<div class="mt-4 text-center">
				<p class="text-xs text-gray-500">
					Or continue with
					<a href="/dashboard" class="text-forest-600 hover:underline">local storage</a>
				</p>
			</div>
		</div>
	</div>
</div>
