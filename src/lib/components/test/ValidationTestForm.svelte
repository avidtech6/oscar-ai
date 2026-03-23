<script lang="ts">
	import { validateForm, validateField, createFormValidator } from '$lib/validation';
	import { formatValidationErrors, getUserFriendlyError } from '$lib/error-handling/error-messages';
	import ValidationErrorDisplay from '$lib/components/error/ValidationErrorDisplay.svelte';
	
	// Form state
	let formData = {
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		age: '',
		website: '',
		phone: ''
	};
	
	let validationResult = $state<any>(null);
	let fieldErrors = $state<Record<string, any>>({});
	let isSubmitting = $state(false);
	let submissionMessage = $state('');
	
	// Form validation rules
	const formRules = {
		name: ['required', 'minLength:3', 'maxLength:50'],
		email: ['required', 'email'],
		password: ['required', 'minLength:8', 'containsUppercase', 'containsNumber'],
		confirmPassword: ['required', 'matchesField:password'],
		age: ['optional', 'number', 'min:18', 'max:120'],
		website: ['optional', 'url'],
		phone: ['optional', 'phone']
	};
	
	// Validate individual field
	function validateFieldOnBlur(fieldName: string, value: string) {
		const result = validateField(fieldName, value, formRules[fieldName] || []);
		fieldErrors[fieldName] = result.errors.length > 0 ? result.errors : null;
	}
	
	// Validate entire form
	function validateFormData() {
		const result = validateForm(formData, formRules);
		validationResult = result;
		
		// Update field errors
		const errors: Record<string, any> = {};
		result.errors.forEach(error => {
			if (!errors[error.field]) errors[error.field] = [];
			errors[error.field].push(error);
		});
		fieldErrors = errors;
		
		return result.valid;
	}
	
	// Handle form submission
	async function handleSubmit() {
		isSubmitting = true;
		submissionMessage = '';
		
		// Validate form
		const isValid = validateFormData();
		
		if (!isValid) {
			submissionMessage = 'Please fix the errors below before submitting.';
			isSubmitting = false;
			return;
		}
		
		// Simulate API call
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			submissionMessage = 'Form submitted successfully!';
			
			// Reset form
			formData = {
				name: '',
				email: '',
				password: '',
				confirmPassword: '',
				age: '',
				website: '',
				phone: ''
			};
			validationResult = null;
			fieldErrors = {};
		} catch (error) {
			submissionMessage = 'Error submitting form. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
	
	// Get field error messages
	function getFieldErrors(fieldName: string) {
		return fieldErrors[fieldName] || [];
	}
	
	// Check if field has errors
	function hasErrors(fieldName: string) {
		return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
	}
</script>

<div class="validation-test-form">
	<h2>Validation System Test Form</h2>
	<p class="description">This form demonstrates the validation system with real-time validation and user-friendly error messages.</p>
	
	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-grid">
			<!-- Name field -->
			<div class="form-group {hasErrors('name') ? 'has-error' : ''}">
				<label for="name">Full Name *</label>
				<input
					id="name"
					type="text"
					bind:value={formData.name}
					on:blur={() => validateFieldOnBlur('name', formData.name)}
					placeholder="Enter your full name"
				/>
				{#if hasErrors('name')}
					<ValidationErrorDisplay errors={getFieldErrors('name')} />
				{/if}
			</div>
			
			<!-- Email field -->
			<div class="form-group {hasErrors('email') ? 'has-error' : ''}">
				<label for="email">Email Address *</label>
				<input
					id="email"
					type="email"
					bind:value={formData.email}
					on:blur={() => validateFieldOnBlur('email', formData.email)}
					placeholder="Enter your email"
				/>
				{#if hasErrors('email')}
					<ValidationErrorDisplay errors={getFieldErrors('email')} />
				{/if}
			</div>
			
			<!-- Password field -->
			<div class="form-group {hasErrors('password') ? 'has-error' : ''}">
				<label for="password">Password *</label>
				<input
					id="password"
					type="password"
					bind:value={formData.password}
					on:blur={() => validateFieldOnBlur('password', formData.password)}
					placeholder="Minimum 8 characters with uppercase and number"
				/>
				{#if hasErrors('password')}
					<ValidationErrorDisplay errors={getFieldErrors('password')} />
				{/if}
			</div>
			
			<!-- Confirm Password field -->
			<div class="form-group {hasErrors('confirmPassword') ? 'has-error' : ''}">
				<label for="confirmPassword">Confirm Password *</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={formData.confirmPassword}
					on:blur={() => validateFieldOnBlur('confirmPassword', formData.confirmPassword)}
					placeholder="Re-enter your password"
				/>
				{#if hasErrors('confirmPassword')}
					<ValidationErrorDisplay errors={getFieldErrors('confirmPassword')} />
				{/if}
			</div>
			
			<!-- Age field -->
			<div class="form-group {hasErrors('age') ? 'has-error' : ''}">
				<label for="age">Age (Optional)</label>
				<input
					id="age"
					type="number"
					bind:value={formData.age}
					on:blur={() => validateFieldOnBlur('age', formData.age)}
					placeholder="18-120"
				/>
				{#if hasErrors('age')}
					<ValidationErrorDisplay errors={getFieldErrors('age')} />
				{/if}
			</div>
			
			<!-- Website field -->
			<div class="form-group {hasErrors('website') ? 'has-error' : ''}">
				<label for="website">Website (Optional)</label>
				<input
					id="website"
					type="url"
					bind:value={formData.website}
					on:blur={() => validateFieldOnBlur('website', formData.website)}
					placeholder="https://example.com"
				/>
				{#if hasErrors('website')}
					<ValidationErrorDisplay errors={getFieldErrors('website')} />
				{/if}
			</div>
			
			<!-- Phone field -->
			<div class="form-group {hasErrors('phone') ? 'has-error' : ''}">
				<label for="phone">Phone Number (Optional)</label>
				<input
					id="phone"
					type="tel"
					bind:value={formData.phone}
					on:blur={() => validateFieldOnBlur('phone', formData.phone)}
					placeholder="+1 (555) 123-4567"
				/>
				{#if hasErrors('phone')}
					<ValidationErrorDisplay errors={getFieldErrors('phone')} />
				{/if}
			</div>
		</div>
		
		<!-- Form actions -->
		<div class="form-actions">
			<button
				type="submit"
				class="submit-btn"
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					Submitting...
				{:else}
					Submit Form
				{/if}
			</button>
			
			<button
				type="button"
				class="validate-btn"
				on:click={validateFormData}
			>
				Validate Form
			</button>
			
			<button
				type="button"
				class="reset-btn"
				on:click={() => {
					formData = {
						name: '',
						email: '',
						password: '',
						confirmPassword: '',
						age: '',
						website: '',
						phone: ''
					};
					validationResult = null;
					fieldErrors = {};
					submissionMessage = '';
				}}
			>
				Reset Form
			</button>
		</div>
		
		<!-- Submission message -->
		{#if submissionMessage}
			<div class="submission-message {submissionMessage.includes('success') ? 'success' : 'error'}">
				{submissionMessage}
			</div>
		{/if}
		
		<!-- Validation summary -->
		{#if validationResult}
			<div class="validation-summary">
				<h3>Validation Summary</h3>
				<div class="summary-stats">
					<span class="stat {validationResult.valid ? 'valid' : 'invalid'}">
						Status: {validationResult.valid ? 'Valid' : 'Invalid'}
					</span>
					<span class="stat">
						Errors: {validationResult.errors.length}
					</span>
					<span class="stat">
						Warnings: {validationResult.warnings.length}
					</span>
					<span class="stat">
						Info: {validationResult.info.length}
					</span>
					<span class="stat">
						Time: {validationResult.time}ms
					</span>
				</div>
				
				{#if validationResult.errors.length > 0}
					<div class="error-summary">
						<h4>Errors:</h4>
						<ul>
							{#each validationResult.errors as error}
								<li>{formatValidationErrors([error])}</li>
							{/each}
						</ul>
					</div>
				{/if}
				
				{#if validationResult.warnings.length > 0}
					<div class="warning-summary">
						<h4>Warnings:</h4>
						<ul>
							{#each validationResult.warnings as warning}
								<li>{formatValidationErrors([warning])}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	</form>
</div>

<style>
	.validation-test-form {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		background: var(--background);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	.description {
		color: var(--text-secondary);
		margin-bottom: 2rem;
		font-size: 0.95rem;
	}
	
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-group label {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.9rem;
	}
	
	.form-group input {
		padding: 0.75rem;
		border: 2px solid var(--border);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
		background: var(--background);
		color: var(--text-primary);
	}
	
	.form-group input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.form-group.has-error input {
		border-color: #ef4444;
	}
	
	.form-group.has-error input:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}
	
	.form-actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	
	.submit-btn,
	.validate-btn,
	.reset-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.95rem;
	}
	
	.submit-btn {
		background: var(--primary);
		color: white;
	}
	
	.submit-btn:hover:not(:disabled) {
		background: var(--primary-dark);
	}
	
	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.validate-btn {
		background: var(--secondary);
		color: var(--text-primary);
		border: 2px solid var(--border);
	}
	
	.validate-btn:hover {
		background: var(--background-hover);
	}
	
	.reset-btn {
		background: transparent;
		color: var(--text-secondary);
		border: 2px solid var(--border);
	}
	
	.reset-btn:hover {
		background: var(--background-hover);
		color: var(--text-primary);
	}
	
	.submission-message {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-weight: 600;
	}
	
	.submission-message.success {
		background: #d1fae5;
		color: #065f46;
		border: 2px solid #10b981;
	}
	
	.submission-message.error {
		background: #fee2e2;
		color: #991b1b;
		border: 2px solid #ef4444;
	}
	
	.validation-summary {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--background-alt);
		border-radius: 8px;
		border: 2px solid var(--border);
	}
	
	.summary-stats {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}
	
	.stat {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.9rem;
		background: var(--background);
		border: 1px solid var(--border);
	}
	
	.stat.valid {
		background: #d1fae5;
		color: #065f46;
		border-color: #10b981;
	}
	
	.stat.invalid {
		background: #fee2e2;
		color: #991b1b;
		border-color: #ef4444;
	}
	
	.error-summary,
	.warning-summary {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 6px;
	}
	
	.error-summary {
		background: #fee2e2;
		border: 2px solid #ef4444;
	}
	
	.error-summary h4 {
		color: #991b1b;
		margin-bottom: 0.5rem;
	}
	
	.error-summary ul {
		margin: 0;
		padding-left: 1.5rem;
	}
	
	.error-summary li {
		color: #991b1b;
		margin-bottom: 0.25rem;
	}
	
	.warning-summary {
		background: #fef3c7;
		border: 2px solid #f59e0b;
	}
	
	.warning-summary h4 {
		color: #92400e;
		margin-bottom: 0.5rem;
	}
	
	.warning-summary ul {
		margin: 0;
		padding-left: 1.5rem;
	}
	
	.warning-summary li {
		color: #92400e;
		margin-bottom: 0.25rem;
	}
	
	@media (max-width: 768px) {
		.validation-test-form {
			padding: 1rem;
		}
		
		.form-grid {
			grid-template-columns: 1fr;
		}
		
		.form-actions {
			flex-direction: column;
		}
		
		.submit-btn,
		.validate-btn,
		.reset-btn {
			width: 100%;
		}
	}
</style>