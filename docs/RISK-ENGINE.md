# NEXUS Risk & Abuse Intelligence — Phase 11

Phase 11 adds an explainable, deterministic risk signal layer for suspicious activity.

## Signals

The reference engine can consume application-observed signals such as:
- new identity
- new device
- unusual IP
- failed-login velocity
- request velocity
- sensitive action
- suspicious input
- known-bad indicator
- impossible travel

NEXUS does not claim that a signal proves fraud or a scam. Signals are evidence used for a risk decision.

## Scoring

Signals have deterministic weights and produce a 0–100 risk score:

- LOW: 0–29
- MEDIUM: 30–59
- HIGH: 60–79
- CRITICAL: 80–100

The score is capped at 100 and duplicate signals count once.

## Decision mapping

- LOW → ALLOW
- MEDIUM → ALLOW by the reference risk policy
- HIGH → REQUIRE_APPROVAL
- CRITICAL → DENY

Applications can layer their own policy controls on top. The risk engine is not a replacement for application authorization.

## Security boundary

Risk evaluation should run before sensitive execution. A production gateway should combine:
1. authenticated identity
2. security guard
3. risk/abuse signals
4. policy evaluation
5. human approval when required
6. audit event

Known-bad indicators and behavioral signals must come from trusted providers or application telemetry; NEXUS does not invent external threat intelligence.

## Production roadmap

Before production, add:
- durable event/risk history
- atomic counters and rate limiting
- trusted device/session management
- IP reputation and threat-intelligence adapters
- account takeover detection
- user notifications and security-event review
- privacy/retention controls
- model-assisted anomaly detection only as an additional explainable signal
- independent security testing

Risk signals should be treated as privacy-sensitive security telemetry and retained only according to a documented purpose and retention policy.
