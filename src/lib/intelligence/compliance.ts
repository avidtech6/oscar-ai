/**
 * Architecture Compliance Verification
 *
 * Verifies that the reconstructed Oscar AI V2 follows the architecture rules:
 * 1. Phase Files are authoritative blueprint
 * 2. HAR provides UI only (no logic)
 * 3. Phase Files take priority over HAR contradictions
 * 4. HAR UI inclusion only if it doesn't violate architecture
 * 5. No legacy logic import from HAR
 */

// Re-export all compliance components from split modules
export type { ComplianceRule, ComplianceCheckResult, ComplianceReport } from './complianceTypes';
export { architectureRules } from './complianceRules';
export { runComplianceChecks, generateComplianceReport, quickComplianceCheck } from './complianceChecks';