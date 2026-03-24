<script lang="ts">
import { validateForm, validateField } from '$lib/validation';
import { formatValidationErrors, getUserFriendlyError } from '$lib/error-handling/error-messages';

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

<ValidationErrorDisplay errors={fieldErrors} />

<form on:submit|prevent={handleSubmit} class="validation-form">
  <div class="form-group">
    <label for="name">Name</label>
    <input
      type="text"
      id="name"
      bind:value={formData.name}
      on:blur={($event) => validateFieldOnBlur('name', $event.target.value)}
      class="form-control"
      placeholder="Enter your name"
    />
    {#if hasErrors('name')}
      <div class="error-message">
        {#each getFieldErrors('name') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      bind:value={formData.email}
      on:blur={($event) => validateFieldOnBlur('email', $event.target.value)}
      class="form-control"
      placeholder="Enter your email"
    />
    {#if hasErrors('email')}
      <div class="error-message">
        {#each getFieldErrors('email') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      bind:value={formData.password}
      on:blur={($event) => validateFieldOnBlur('password', $event.target.value)}
      class="form-control"
      placeholder="Enter your password"
    />
    {#if hasErrors('password')}
      <div class="error-message">
        {#each getFieldErrors('password') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input
      type="password"
      id="confirmPassword"
      bind:value={formData.confirmPassword}
      on:blur={($event) => validateFieldOnBlur('confirmPassword', $event.target.value)}
      class="form-control"
      placeholder="Confirm your password"
    />
    {#if hasErrors('confirmPassword')}
      <div class="error-message">
        {#each getFieldErrors('confirmPassword') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <label for="age">Age</label>
    <input
      type="number"
      id="age"
      bind:value={formData.age}
      on:blur={($event) => validateFieldOnBlur('age', $event.target.value)}
      class="form-control"
      placeholder="Enter your age"
    />
    {#if hasErrors('age')}
      <div class="error-message">
        {#each getFieldErrors('age') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <label for="website">Website</label>
    <input
      type="url"
      id="website"
      bind:value={formData.website}
      on:blur={($event) => validateFieldOnBlur('website', $event.target.value)}
      class="form-control"
      placeholder="Enter your website"
    />
    {#if hasErrors('website')}
      <div class="error-message">
        {#each getFieldErrors('website') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <label for="phone">Phone</label>
    <input
      type="tel"
      id="phone"
      bind:value={formData.phone}
      on:blur={($event) => validateFieldOnBlur('phone', $event.target.value)}
      class="form-control"
      placeholder="Enter your phone number"
    />
    {#if hasErrors('phone')}
      <div class="error-message">
        {#each getFieldErrors('phone') as error}
          {getUserFriendlyError(error)}
        {/each}
      </div>
    {/if}
  </div>

  <div class="form-group">
    <button type="submit" disabled={isSubmitting} class="btn">
      {isSubmitting ? 'Submitting...' : 'Submit Form'}
    </button>
    {submissionMessage && <p class="submission-message">{submissionMessage}</p>}
  </div>
</form>