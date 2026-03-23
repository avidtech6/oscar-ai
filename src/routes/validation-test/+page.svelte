<script lang="ts">
	import ValidationTestForm from '$lib/components/test/ValidationTestForm.svelte';
	import { validateForm, validateField, getValidationRules } from '$lib/validation';
	import { formatValidationErrors, getUserFriendlyError, createValidationSummary } from '$lib/error-handling/error-messages';
	
	// Test data for validation
	let testData = {
		email: 'invalid-email',
		password: 'weak',
		age: '15',
		website: 'not-a-url',
		phone: '123'
	};
	
	let validationResults = $state<any>(null);
	let testResults = $state<any[]>([]);
	
	// Run validation tests
	function runValidationTests() {
		testResults = [];
		
		// Test 1: Email validation
		const emailResult = validateField('email', testData.email, ['required', 'email']);
		testResults.push({
			name: 'Email Validation',
			input: testData.email,
			expected: 'Invalid email format',
			result: emailResult,
			passed: emailResult.errors.some(e => e.rule === 'email')
		});
		
		// Test 2: Password validation
		const passwordResult = validateField('password', testData.password, ['required', 'minLength:8', 'containsUppercase', 'containsNumber']);
		testResults.push({
			name: 'Password Validation',
			input: testData.password,
			expected: 'Multiple validation errors',
			result: passwordResult,
			passed: passwordResult.errors.length >= 2
		});
		
		// Test 3: Age validation
		const ageResult = validateField('age', testData.age, ['optional', 'number', 'min:18']);
		testResults.push({
			name: 'Age Validation',
			input: testData.age,
			expected: 'Minimum age is 18',
			result: ageResult,
			passed: ageResult.errors.some(e => e.rule === 'min')
		});
		
		// Test 4: URL validation
		const urlResult = validateField('website', testData.website, ['optional', 'url']);
		testResults.push({
			name: 'URL Validation',
			input: testData.website,
			expected: 'Invalid URL format',
			result: urlResult,
			passed: urlResult.errors.some(e => e.rule === 'url')
		});
		
		// Test 5: Phone validation
		const phoneResult = validateField('phone', testData.phone, ['optional', 'phone']);
		testResults.push({
			name: 'Phone Validation',
			input: testData.phone,
			expected: 'Invalid phone number format',
			result: phoneResult,
			passed: phoneResult.errors.some(e => e.rule === 'phone')
		});
		
		// Test 6: Full form validation
		const formRules = {
			email: ['required', 'email'],
			password: ['required', 'minLength:8'],
			age: ['optional', 'number', 'min:18'],
			website: ['optional', 'url'],
			phone: ['optional', 'phone']
		};
		
		const formResult = validateForm(testData, formRules);
		testResults.push({
			name: 'Full Form Validation',
			input: 'All test fields',
			expected: 'Multiple validation errors',
			result: formResult,
			passed: !formResult.valid && formResult.errors.length >= 3
		});
		
		validationResults = formResult;
	}
	
	// Run tests on mount
	runValidationTests();
</script>

<div class="validation-test-page">
	<header class="page-header">
		<h1>Validation System Test Suite</h1>
		<p class="subtitle">Comprehensive testing of the validation system with real form submissions</p>
	</header>
	
	<div class="content-grid">
		<!-- Test Form Section -->
		<section class="test-form-section">
			<h2>Interactive Test Form</h2>
			<p>Use this form to test the validation system in real-time with various input scenarios.</p>
			
			<ValidationTestForm />
		</section>
		
		<!-- Test Results Section -->
		<section class="test-results-section">
			<h2>Automated Test Results</h2>
			<p>These tests validate the core validation system functionality with predefined test cases.</p>
			
			<div class="test-controls">
				<button on:click={runValidationTests} class="run-tests-btn">
					Run All Tests
				</button>
				<span class="test-count">
					{testResults.length} tests executed
				</span>
			</div>
			
			<div class="test-results-grid">
				{#each testResults as test, i}
					<div class="test-card {test.passed ? 'passed' : 'failed'}">
						<div class="test-header">
							<h3>{test.name}</h3>
							<span class="test-status">
								{#if test.passed}
									✅ Passed
								{:else}
									❌ Failed
								{/if}
							</span>
						</div>
						
						<div class="test-details">
							<div class="detail-row">
								<span class="detail-label">Input:</span>
								<code class="detail-value">{test.input}</code>
							</div>
							
							<div class="detail-row">
								<span class="detail-label">Expected:</span>
								<span class="detail-value">{test.expected}</span>
							</div>
							
							<div class="detail-row">
								<span class="detail-label">Result:</span>
								<span class="detail-value">
									{#if test.result.valid}
										Valid
									{:else}
										Invalid ({test.result.errors.length} errors)
									{/if}
								</span>
							</div>
							
							{#if test.result.errors.length > 0}
								<div class="error-list">
									<span class="detail-label">Errors:</span>
									<ul>
										{#each test.result.errors as error}
											<li>{formatValidationErrors([error])}</li>
										{/each}
									</ul>
								</div>
							{/if}
							
							{#if test.result.warnings.length > 0}
								<div class="warning-list">
									<span class="detail-label">Warnings:</span>
									<ul>
										{#each test.result.warnings as warning}
											<li>{formatValidationErrors([warning])}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			
			<!-- Overall Validation Summary -->
			{#if validationResults}
				<div class="overall-summary">
					<h3>Overall Validation Summary</h3>
					<div class="summary-content">
						{createValidationSummary(validationResults)}
					</div>
				</div>
			{/if}
		</section>
		
		<!-- Documentation Section -->
		<section class="documentation-section">
			<h2>Validation System Documentation</h2>
			
			<div class="doc-card">
				<h3>Available Validation Rules</h3>
				<ul class="rules-list">
					<li><strong>required</strong> - Field must not be empty</li>
					<li><strong>email</strong> - Valid email format</li>
					<li><strong>url</strong> - Valid URL format</li>
					<li><strong>phone</strong> - Valid phone number format</li>
					<li><strong>number</strong> - Numeric value</li>
					<li><strong>minLength:X</strong> - Minimum length (e.g., minLength:8)</li>
					<li><strong>maxLength:X</strong> - Maximum length (e.g., maxLength:50)</li>
					<li><strong>min:X</strong> - Minimum numeric value (e.g., min:18)</li>
					<li><strong>max:X</strong> - Maximum numeric value (e.g., max:120)</li>
					<li><strong>containsUppercase</strong> - Must contain uppercase letter</li>
					<li><strong>containsNumber</strong> - Must contain number</li>
					<li><strong>matchesField:fieldName</strong> - Must match another field</li>
					<li><strong>optional</strong> - Field is optional (no validation if empty)</li>
				</ul>
			</div>
			
			<div class="doc-card">
				<h3>Usage Examples</h3>
				<pre><code>// Validate a single field
const result = validateField('email', 'user@example.com', ['required', 'email']);

// Validate a complete form
const formRules = {
  name: ['required', 'minLength:3'],
  email: ['required', 'email'],
  age: ['optional', 'number', 'min:18']
};

const formResult = validateForm(formData, formRules);

// Get user-friendly error messages
import { formatValidationErrors } from '$lib/error-handling/error-messages';
const errorMessage = formatValidationErrors(formResult.errors);</code></pre>
			</div>
			
			<div class="doc-card">
				<h3>Error Severity Levels</h3>
				<ul class="severity-list">
					<li><span class="severity-badge error">Error</span> - Critical validation failure</li>
					<li><span class="severity-badge warning">Warning</span> - Non-critical validation issue</li>
					<li><span class="severity-badge info">Info</span> - Informational validation message</li>
				</ul>
			</div>
		</section>
	</div>
</div>

<style>
	.validation-test-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}
	
	.page-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}
	
	.subtitle {
		color: var(--text-secondary);
		font-size: 1.1rem;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}
	
	section {
		background: var(--background);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border);
	}
	
	section h2 {
		font-size: 1.75rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
		border-bottom: 2px solid var(--border);
		padding-bottom: 0.5rem;
	}
	
	section p {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}
	
	/* Test Results Section */
	.test-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background: var(--background-alt);
		border-radius: 8px;
	}
	
	.run-tests-btn {
		padding: 0.75rem 1.5rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.run-tests-btn:hover {
		background: var(--primary-dark);
	}
	
	.test-count {
		font-weight: 600;
		color: var(--text-secondary);
	}
	
	.test-results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.test-card {
		border-radius: 8px;
		padding: 1.5rem;
		border: 2px solid;
	}
	
	.test-card.passed {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.05);
	}
	
	.test-card.failed {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.05);
	}
	
	.test-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.test-header h3 {
		font-size: 1.1rem;
		margin: 0;
		color: var(--text-primary);
	}
	
	.test-status {
		font-weight: 600;
		font-size: 0.9rem;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
	}
	
	.test-card.passed .test-status {
		background: #d1fae5;
		color: #065f46;
	}
	
	.test-card.failed .test-status {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.test-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	
	.detail-label {
		font-weight: 600;
		color: var(--text-secondary);
		font-size: 0.9rem;
		min-width: 80px;
	}
	
	.detail-value {
		flex: 1;
		text-align: right;
		color: var(--text-primary);
		font-size: 0.9rem;
		word-break: break-word;
	}
	
	.detail-value code {
		background: var(--background-alt);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.85rem;
	}
	
	.error-list,
	.warning-list {
		margin-top: 0.5rem;
	}
	
	.error-list ul,
	.warning-list ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1.5rem;
	}
	
	.error-list li {
		color: #991b1b;
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}
	
	.warning-list li {
		color: #92400e;
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}
	
	.overall-summary {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--background-alt);
		border-radius: 8px;
		border: 2px solid var(--border);
	}
	
	.overall-summary h3 {
		margin-bottom: 1rem;
		color: var(--text-primary);
	}
	
	.summary-content {
		background: var(--background);
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid var(--border);
	}
	
	/* Documentation Section */
	.doc-card {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--background-alt);
		border-radius: 8px;
		border: 1px solid var(--border);
	}
	
	.doc-card:last-child {
		margin-bottom: 0;
	}
	
	.doc-card h3 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}
	
	.rules-list,
	.severity-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.rules-list li,
	.severity-list li {
		margin-bottom: 0.75rem;
		padding-left: 0;
		color: var(--text-primary);
	}
	
	.rules-list li:before {
		content: '✓';
		color: #10b981;
		margin-right: 0.75rem;
		font-weight: bold;
	}
	
	.severity-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.85rem;
		margin-right: 0.5rem;
	}
	
	.severity-badge.error {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.severity-badge.warning {
		background: #fef3c7;
		color: #92400e;
	}
	
	.severity-badge.info {
		background: #dbeafe;
		color: #1e40af;
	}
	
	pre {
		background: var(--background-alt);
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		b