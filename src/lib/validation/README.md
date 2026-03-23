# Validation System Documentation

## Overview

The Oscar AI Validation System provides a comprehensive, modular approach to data validation across the entire application. It supports form validation, API request validation, and general data validation with user-friendly error messages and multiple severity levels.

## Core Concepts

### Validation Rules
Validation rules are the building blocks of the validation system. Each rule defines a specific validation constraint that can be applied to a field.

### Validation Results
Every validation operation returns a `ValidationResult` object containing:
- `valid`: Boolean indicating overall validation status
- `errors`: Array of critical validation errors
- `warnings`: Array of non-critical validation warnings  
- `info`: Array of informational validation messages
- `duration`: Validation execution time

### Error Severity Levels
- **Error**: Critical validation failure that prevents form submission
- **Warning**: Non-critical issue that should be addressed but doesn't block submission
- **Info**: Informational message about validation state

## Available Validation Rules

### Basic Rules
| Rule | Description | Example | Error Message |
|------|-------------|---------|---------------|
| `required` | Field must not be empty | `['required']` | "This field is required" |
| `email` | Valid email format | `['email']` | "Please enter a valid email address" |
| `url` | Valid URL format | `['url']` | "Please enter a valid URL" |
| `phone` | Valid phone number format | `['phone']` | "Please enter a valid phone number" |
| `number` | Numeric value | `['number']` | "Please enter a valid number" |
| `optional` | Field is optional (no validation if empty) | `['optional']` | - |

### Length Rules
| Rule | Description | Example | Error Message |
|------|-------------|---------|---------------|
| `minLength:X` | Minimum character length | `['minLength:8']` | "Must be at least 8 characters" |
| `maxLength:X` | Maximum character length | `['maxLength:50']` | "Must be at most 50 characters" |
| `exactLength:X` | Exact character length | `['exactLength:10']` | "Must be exactly 10 characters" |

### Numeric Rules
| Rule | Description | Example | Error Message |
|------|-------------|---------|---------------|
| `min:X` | Minimum numeric value | `['min:18']` | "Must be at least 18" |
| `max:X` | Maximum numeric value | `['max:120']` | "Must be at most 120" |
| `range:X-Y` | Numeric range | `['range:1-100']` | "Must be between 1 and 100" |

### Pattern Rules
| Rule | Description | Example | Error Message |
|------|-------------|---------|---------------|
| `containsUppercase` | Must contain uppercase letter | `['containsUppercase']` | "Must contain at least one uppercase letter" |
| `containsNumber` | Must contain number | `['containsNumber']` | "Must contain at least one number" |
| `containsSpecial` | Must contain special character | `['containsSpecial']` | "Must contain at least one special character" |
| `pattern:regex` | Custom regex pattern | `['pattern:^[A-Z]']` | "Must match the required pattern" |

### Comparison Rules
| Rule | Description | Example | Error Message |
|------|-------------|---------|---------------|
| `matchesField:fieldName` | Must match another field | `['matchesField:password']` | "Must match the password field" |
| `differentFrom:fieldName` | Must be different from another field | `['differentFrom:username']` | "Must be different from username" |

### Date Rules
| Rule | Description | Example | Error Message |
|------|-------------|---------|---------------|
| `date` | Valid date format | `['date']` | "Please enter a valid date" |
| `minDate:YYYY-MM-DD` | Minimum date | `['minDate:2024-01-01']` | "Date must be after 2024-01-01" |
| `maxDate:YYYY-MM-DD` | Maximum date | `['maxDate:2024-12-31']` | "Date must be before 2024-12-31" |

## Usage Examples

### Basic Field Validation
```typescript
import { validateField } from '$lib/validation';

// Validate a single field
const result = validateField('email', 'user@example.com', ['required', 'email']);

if (result.valid) {
  console.log('Email is valid');
} else {
  console.log('Validation errors:', result.errors);
}
```

### Form Validation
```typescript
import { validateForm } from '$lib/validation';

const formData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  age: 25
};

const formRules = {
  name: ['required', 'minLength:3'],
  email: ['required', 'email'],
  password: ['required', 'minLength:8', 'containsUppercase', 'containsNumber'],
  age: ['optional', 'number', 'min:18']
};

const result = validateForm(formData, formRules);

if (result.valid) {
  // Submit form
} else {
  // Display errors
  result.errors.forEach(error => {
    console.log(`${error.field}: ${error.message}`);
  });
}
```

### Real-time Validation in Svelte Components
```svelte
<script lang="ts">
  import { validateField } from '$lib/validation';
  import ValidationErrorDisplay from '$lib/components/error/ValidationErrorDisplay.svelte';

  let email = '';
  let emailErrors = [];

  function validateEmail() {
    const result = validateField('email', email, ['required', 'email']);
    emailErrors = result.errors;
  }
</script>

<input 
  type="email" 
  bind:value={email} 
  on:blur={validateEmail}
  placeholder="Enter your email"
/>

<ValidationErrorDisplay errors={emailErrors} />
```

### Custom Validation Rules
```typescript
import { registerValidationRule } from '$lib/validation';

// Register a custom validation rule
registerValidationRule({
  name: 'customRule',
  validate: (value, context) => {
    // Custom validation logic
    const valid = value === 'custom';
    return {
      valid,
      error: valid ? undefined : 'Value must be "custom"'
    };
  },
  priority: 10
});

// Use the custom rule
const result = validateField('field', 'value', ['customRule']);
```

## Error Handling and Display

### User-Friendly Error Messages
```typescript
import { formatValidationErrors, getUserFriendlyError } from '$lib/error-handling/error-messages';

// Format errors for display
const formattedErrors = formatValidationErrors(validationResult.errors);

// Get user-friendly error for a specific field
const errorMessage = getUserFriendlyError('email', 'required');
// Returns: "Email is required"
```

### Validation Error Display Component
```svelte
<ValidationErrorDisplay 
  errors={errors}
  field="email"
  showFieldName={true}
  className="validation-errors"
/>
```

### Validation Summary
```typescript
import { createValidationSummary } from '$lib/error-handling/error-messages';

const summary = createValidationSummary(validationResult);
// Returns HTML string with validation summary
```

## Advanced Features

### Conditional Validation
```typescript
const rules = {
  email: ['required', 'email'],
  phone: (data) => {
    // Only require phone if email is not provided
    return !data.email ? ['required', 'phone'] : ['optional'];
  }
};
```

### Cross-Field Validation
```typescript
const rules = {
  password: ['required', 'minLength:8'],
  confirmPassword: ['required', 'matchesField:password']
};
```

### Async Validation
```typescript
import { validateFieldAsync } from '$lib/validation';

async function checkUsernameAvailability(username) {
  const result = await validateFieldAsync('username', username, [
    'required',
    'minLength:3',
    async (value) => {
      const available = await api.checkUsername(value);
      return {
        valid: available,
        error: available ? undefined : 'Username is already taken'
      };
    }
  ]);
  return result;
}
```

## Integration with Forms

### Form Component Integration
```svelte
<script lang="ts">
  import { validateForm } from '$lib/validation';
  import { formStore } from '$lib/stores/form';

  let formData = $state({});
  let validationErrors = $state({});

  function handleSubmit() {
    const result = validateForm(formData, formRules);
    
    if (result.valid) {
      // Submit form
      formStore.submit(formData);
    } else {
      // Update validation errors
      validationErrors = result.errors.reduce((acc, error) => {
        if (!acc[error.field]) acc[error.field] = [];
        acc[error.field].push(error);
        return acc;
      }, {});
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <!-- Form fields -->
</form>
```

### Real-time Validation with Debouncing
```typescript
import { debounce } from '$lib/utils';
import { validateField } from '$lib/validation';

const debouncedValidation = debounce((field, value, rules) => {
  const result = validateField(field, value, rules);
  // Update UI with validation result
}, 300);

// Use in input event handler
function handleInput(event) {
  const { name, value } = event.target;
  debouncedValidation(name, value, formRules[name]);
}
```

## Best Practices

### 1. Always Validate on Both Client and Server
- Client-side validation provides immediate feedback
- Server-side validation ensures data integrity

### 2. Use Appropriate Severity Levels
- Use `error` for critical validation failures
- Use `warning` for suggestions or non-critical issues
- Use `info` for helpful hints or guidance

### 3. Provide Clear Error Messages
- Be specific about what's wrong
- Suggest how to fix the issue
- Use consistent language and tone

### 4. Validate Early and Often
- Validate on blur for immediate feedback
- Validate on form submission for completeness
- Validate on data change for real-time updates

### 5. Group Related Validations
- Keep validation rules organized by field
- Use consistent rule naming conventions
- Document custom validation rules

## Performance Considerations

### 1. Minimize Validation Frequency
- Use debouncing for real-time validation
- Validate only when necessary
- Cache validation results when appropriate

### 2. Optimize Validation Rules
- Order rules by priority (most likely failures first)
- Use efficient validation logic
- Avoid expensive operations in validation functions

### 3. Batch Validations
- Validate multiple fields at once when possible
- Use form-level validation for complex dependencies
- Consider lazy validation for non-critical fields

## Troubleshooting

### Common Issues

#### 1. Validation Not Triggering
- Check that validation rules are correctly defined
- Ensure validation function is being called
- Verify that field names match between data and rules

#### 2. Incorrect Error Messages
- Check error message templates in `error-messages.ts`
- Verify rule names match between validation and error handling
- Ensure context data is being passed correctly

#### 3. Performance Problems
- Reduce validation frequency with debouncing
- Simplify complex validation rules
- Consider caching validation results

### Debugging Tips

```typescript
// Enable debug logging
import { setValidationDebug } from '$lib/validation';
setValidationDebug(true);

// Check validation state
console.log('Validation result:', validationResult);
console.log('Validation errors:', validationResult.errors);
console.log('Validation warnings:', validationResult.warnings);
```

## API Reference

### Core Functions

#### `validateField(field: string, value: any, rules: Array<string | Function>): ValidationResult`
Validates a single field against the specified rules.

#### `validateForm(data: Record<string, any>, rules: Record<string, any>): ValidationResult`
Validates a complete form against the specified rules.

#### `registerValidationRule(rule: ValidationRule): void`
Registers a custom validation rule.

#### `getValidationRules(): Record<string, ValidationRule>`
Returns all registered validation rules.

### Error Handling Functions

#### `formatValidationErrors(errors: ValidationError[]): string`
Formats validation errors into a user-friendly string.

#### `getUserFriendlyError(field: string, rule: string, context?: any): string`
Returns a user-friendly error message for a specific field and rule.

#### `createValidationSummary(result: ValidationResult): string`
Creates an HTML summary of validation results.

## Migration Guide

### From Legacy Validation System
1. Replace custom validation functions with standardized rules
2. Update error handling to use the new error format
3. Migrate validation logic to use the new API

### Adding New Validation Rules
1. Define the rule in `validation-rules.ts`
2. Add error message templates in `error-messages.ts`
3. Test the rule with various input values
4. Document the rule in this README

## Contributing

### Adding New Features
1. Follow the modular architecture
2. Maintain backward compatibility
3. Add comprehensive tests
4. Update documentation

### Reporting Issues
1. Provide reproduction steps
2. Include validation rules and data
3. Specify expected vs actual behavior
4. Include browser/device information

## License

This validation system is part of the Oscar AI application and follows the same licensing terms.