# Hospital Intelligence System

## Current State
Backend checks AccessControl.hasPermission(caller, #user) but users logging in via Internet Identity are never assigned the user role, so all writes fail with Unauthorized.

## Requested Changes (Diff)

### Add
- Nothing

### Modify
- Backend: Replace permission checks with Principal.isAnonymous(caller) guard

### Remove
- Complex role checks on data operations

## Implementation Plan
1. Update main.mo permission checks
