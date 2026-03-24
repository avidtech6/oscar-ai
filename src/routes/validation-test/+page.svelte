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
      </div>
      
      <div class="test-results">
        {#each testResults as test}
          <div class="test-item">
            <h3>{test.name}</h3>
            <p><strong>Input:</strong> {test.input}</p>
            <p><strong>Expected:</strong> {test.expected}</p>
            <p><strong>Result:</strong> {test.result.errors?.map(e => getUserFriendlyError(e)).join(', ') || 'No errors'}</p>
            <p><strong>Status:</strong> {test.passed ? 'Passed' : 'Failed'}</p>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>