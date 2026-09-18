# NEXUS Terms & Conditions

**Effective date:** 18 September 2026

These terms apply to the NEXUS software repository and documentation. NEXUS is open-source software licensed under the MIT License.

## 1. Purpose
NEXUS is a technical control-plane and policy-enforcement component for AI-agent actions, provided for development, research, testing, and integration.

## 2. No guarantee of safety
NEXUS does not guarantee detection or prevention of every malicious prompt, unsafe action, vulnerability, credential leak, or policy bypass. Security heuristics are not proof of security.

## 3. Operator responsibility
The operator is responsible for policies, permissions, identities, credentials, network controls, approvals, retention, and deployment security. NEXUS approval does not replace authorization required by a target system.

## 4. External systems
Third-party tools and services remain subject to their own terms, permissions, privacy practices, availability, and security controls.

## 5. Human approval
Approval is a safeguard, not authorization by itself. Operators should verify the action, target, scope, and identity before approving sensitive operations.

## 6. Credentials and secrets
Use an appropriate secret-management system. Never commit real credentials to the repository or place them in tests, examples, audit events, or issue reports.

## 7. Audit and privacy
Audit records may contain action metadata and must be handled according to applicable privacy, retention, and access-control requirements. The in-memory audit implementation is not production-grade storage.

## 8. AI-generated actions
Treat actions originating from AI systems as untrusted input until validated by the configured security and policy controls.

## 9. Acceptable use
Users must comply with applicable law, third-party terms, and organizational policies. Do not use NEXUS to bypass authorization, compromise systems, exfiltrate credentials, or conduct unlawful activity.

## 10. Changes
These terms may be updated as the project evolves. The repository commit history records changes.

## 11. License
Use and redistribution are governed by the MIT License included in the repository.
