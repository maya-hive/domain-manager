# Task: n8n API Integration

## Requirements
Create Convex HTTP Actions to expose endpoints for the n8n automation pipeline.

1. **GET `/api/domains`:** - Returns a JSON array of all domains (ID, name, expiration date) for n8n to check against registrars.
2. **POST `/api/domains/update-expire`:** - Accepts payload: `{ "domainName": "example.com", "expireDate": 1735689600 }`.
   - Triggers the `updateExpireByName` internal mutation.
3. **Security:** Require a static API key/Bearer token in the headers for both endpoints.