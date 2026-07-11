# Supabase Connection Audit & Diagnostics Report

**Date**: 2026-07-11  
**Project**: Portail SHM Maroc  
**Status**: ⚠️ CRITICAL ISSUE IDENTIFIED

## 1. CRITICAL FINDING: Environment Variable Mismatch

### Problem
The dev server is loading **placeholder values** at runtime despite real Supabase credentials present in `.env`:

```
Runtime Environment:
  SUPABASE_URL="https://placeholder.supabase.co"  ❌ PLACEHOLDER
  SUPABASE_SERVICE_ROLE_KEY="[masked]"            ❌ EMPTY/PLACEHOLDER
  VITE_SUPABASE_URL="https://placeholder.supabase.co"  ❌ PLACEHOLDER

.env File (Actual):
  SUPABASE_URL="https://hwglhastcmqgrvvxmaae.supabase.co"  ✅ REAL
  SUPABASE_SERVICE_ROLE_KEY="[actual JWT]"         ✅ REAL
  VITE_SUPABASE_URL="https://hwglhastcmqgrvvxmaae.supabase.co"  ✅ REAL
```

### Root Cause
The dev server process started before `.env` was populated or the dotenv loading is not properly initialized.

### Impact
- **All Supabase API calls fail** with invalid credentials
- `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-identity` return 401/500 errors
- Frontend sees `TypeError: fetch failed`
- Data is never actually stored in the database

### Solution Path
The dev server must be **restarted** to reload environment variables properly. The code is correct; the runtime environment is stale.

---

## 2. Supabase Communication Endpoints Audit

### All Registered Routes (from `server/index.ts`)

| Endpoint | Method | Handler | Status | Notes |
|----------|--------|---------|--------|-------|
| `/api/diagnostics/supabase` | GET | `handleSupabaseDiagnostics` | ✅ Implemented | Can test connection |
| `/api/auth/register` | POST | `handleRegister` | ⚠️ Failing | Invalid credentials |
| `/api/auth/login` | POST | `handleLogin` | ⚠️ Failing | Invalid credentials |
| `/api/auth/profile` | GET | `handleGetProfile` | ⚠️ Failing | Invalid credentials |
| `/api/auth/save-documents` | POST | `handleSavePdfQrCode` | ⚠️ Failing | Invalid credentials |
| `/api/auth/verify-identity` | POST | `handleVerifyIdentity` | ⚠️ Failing | Invalid credentials |
| `/api/auth/reset-password` | POST | `handleResetPassword` | ⚠️ Failing | Invalid credentials |
| `/api/admin/regenerate-documents` | POST | `handleRegenerateDocuments` | ⚠️ Failing | Invalid credentials |
| `/api/admin/document-status` | GET | `handleGetDocumentStatus` | ⚠️ Failing | Invalid credentials |
| `/api/whatsapp/send-registration` | POST | `handleSendRegistrationWhatsApp` | ⚠️ Failing | Invalid credentials |
| `/api/whatsapp/incoming-idea` | POST | `handleIncomingIdea` | ⚠️ Failing | Invalid credentials |

### Supabase Tables Queried

1. **users** (INSERT, SELECT, UPDATE)
   - register: INSERT new user
   - login: SELECT by first_name, last_name, generated_id
   - get-profile: SELECT by generated_id
   - verify-identity: SELECT by first_name, last_name, user_phone, birth_date, generated_id
   - reset-password: UPDATE by generated_id

2. **documents** (SELECT, UPDATE) - in regenerate-documents route
3. **ideas** (INSERT, SELECT) - in ideas routes
4. **whatsapp_messages** (INSERT) - in WhatsApp routes

---

## 3. Error Logging Implementation Status

### ✅ Already Implemented
- Console error logs in all route handlers
- Supabase error messages passed to client
- Try/catch blocks in all async handlers
- Diagnostic endpoint with detailed config logging

### Examples of Good Error Logging

**Register Handler (server/routes/auth.ts:103-107)**
```typescript
if (error) {
  console.error("Supabase error:", error);
  return res.status(400).json({ error: error.message || "Registration failed" });
}
```

**Password Recovery (server/routes/password-recovery.ts:49-54)**
```typescript
catch (error) {
  console.error("Error verifying identity:", error);
  res.status(500).json({
    error: "خطأ في الخادم",
    details: String(error),
  });
}
```

**Diagnostics Endpoint (server/routes/diagnostics.ts)**
- Logs Supabase config status
- Tests actual connection with `.select()` query
- Returns detailed error info if connection fails

### ⚠️ Areas for Enhancement
- Add request logging middleware (log method, endpoint, timestamp)
- Add structured logging with severity levels
- Add correlation IDs for tracing requests
- Add client-side error logging to analytics

---

## 4. Data Normalization Implementation Status

### ✅ Phone Number Normalization

**File**: `shared/utils.ts:28-67`

**Implemented**:
- ✅ Strips spaces, dashes, parentheses, dots
- ✅ Converts +212, 00212, 212 formats to 0XXXXXXXXX
- ✅ Handles 9-digit input without leading 0
- ✅ Validates Moroccan prefixes (06, 07, 08, 09, 05)
- ✅ Returns null for invalid formats

**Accepted Formats**:
- `06 66 94 71 66` → `0666947166` ✅
- `0666-94-71-66` → `0666947166` ✅
- `+212 666947166` → `0666947166` ✅
- `00212666947166` → `0666947166` ✅
- `212666947166` → `0666947166` ✅
- `666947166` → `0666947166` ✅
- `(212) 666947166` → `0666947166` ✅

**Applied Locations**:
1. **Frontend** (Register page):
   - `client/pages/Register.tsx:228-231` - All four phone fields normalized
2. **Frontend** (Forgot Password):
   - `client/pages/ForgotPassword.tsx:59-60` - User phone normalized
3. **Backend** (Register):
   - `server/routes/auth.ts:56-59` - All phone fields normalized
4. **Backend** (Password Recovery):
   - `server/routes/password-recovery.ts:15` - User phone normalized

### ✅ Text Field Trimming

**File**: `shared/utils.ts:1-25`

**Implemented**:
- ✅ `trimFormData()` - Trims all string values in object
- ✅ `trimString()` - Trims single string value

**Applied Locations**:
1. **Register Handler** (server/routes/auth.ts:44-53):
   - first_name, last_name, gender
   - guardian_first_name, guardian_last_name
   - guardian_relationship, guardian_relationship_other, guardian_cin
   - additional_info, password
2. **Login Handler** (server/routes/auth.ts:134-137):
   - first_name, last_name, generated_id, password
3. **Password Recovery** (server/routes/password-recovery.ts:10-12, 63-64):
   - firstName, lastName, memberId, newPassword
4. **Frontend Forms**:
   - Register page normalizes before submit
   - Forgot password page normalizes before submit

### ⚠️ Missing: Multiple Space Reduction
- Trim is implemented ✅
- Multiple internal spaces NOT reduced to single space ❌
- Example: "John    Doe" would store as "John    Doe" (4 spaces preserved)

### ⚠️ Missing: Case Harmonization
- No automatic case normalization for names
- Example: "jOHN" stores as "jOHN" instead of "John" ❌

---

## 5. Normalization Enhancement Plan

### Recommended Improvements

#### A. Enhanced Text Normalization Function
```typescript
export function normalizeText(text: string): string {
  // Trim edges
  let normalized = text.trim();
  
  // Reduce multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Optional: Title case for names
  // normalized = normalized
  //   .split(' ')
  //   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //   .join(' ');
  
  return normalized;
}
```

#### B. Apply to All Text Fields Before Storage
- Should be applied on BOTH frontend and backend
- Frontend: for immediate UX feedback
- Backend: for data integrity (if frontend is bypassed)

#### C. Handle Edge Cases
- Non-breaking spaces (U+00A0) should be treated as regular spaces
- Control characters should be stripped
- Unicode normalization (for Arabic/French text)

---

## 6. Test Cases for Validation

### Phone Number Tests
```javascript
// Valid cases
normalizePhoneNumber("06 66 94 71 66") === "0666947166" ✅
normalizePhoneNumber("+212 666947166") === "0666947166" ✅
normalizePhoneNumber("00212666947166") === "0666947166" ✅
normalizePhoneNumber("666947166") === "0666947166" ✅
normalizePhoneNumber("(212) 666-94-71-66") === "0666947166" ✅

// Invalid cases
normalizePhoneNumber("0766947166") === "0766947166" ✅ (valid 07 prefix)
normalizePhoneNumber("0466947166") === null ❌ (invalid 04 prefix)
normalizePhoneNumber("12345") === null ❌ (too short)
normalizePhoneNumber("+33666947166") === null ❌ (French number)
```

### Text Normalization Tests
```javascript
// Current behavior (trim only)
trimString("  John  ") === "John" ✅
trimString("John    Doe") === "John    Doe" ⚠️ (multiple spaces preserved)

// Should be (with enhancement)
normalizeText("  John  ") === "John" ✅
normalizeText("John    Doe") === "John Doe" ✅
normalizeText("JOHN") === "John" ✅ (if case normalization enabled)
normalizeText("  Jean   Paul  ") === "Jean Paul" ✅
normalizeText("محمد علي") === "محمد علي" ✅ (Arabic text)
```

---

## 7. Immediate Next Steps

### Priority 1: Fix Environment Loading ⚠️ CRITICAL
- [ ] Restart dev server to load real Supabase credentials from `.env`
- [ ] Verify `/api/diagnostics/supabase` returns success
- [ ] Test `/api/auth/login` and `/api/auth/register` with real database

### Priority 2: Enhance Normalization
- [ ] Add `normalizeText()` function to `shared/utils.ts`
- [ ] Apply to all text fields in auth routes (backend)
- [ ] Apply to all form inputs (frontend)
- [ ] Test with edge cases (multiple spaces, special characters, non-breaking spaces)

### Priority 3: Improve Error Logging
- [ ] Add request logging middleware
- [ ] Add structured logging with correlation IDs
- [ ] Test error messages are captured and logged

### Priority 4: Comprehensive Testing
- [ ] Test all authentication flows with normalized data
- [ ] Test phone numbers in all formats
- [ ] Verify data in database is properly normalized
- [ ] Check for duplicate detection with different phone formats

---

## 8. Configuration Files Status

### ✅ `.env` - Present and Contains Real Credentials
```
SUPABASE_URL=https://hwglhastcmqgrvvxmaae.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://hwglhastcmqgrvvxmaae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### ✅ `server/config.ts` - Runtime Config Loader
- Loads from environment
- Logs warnings if placeholders detected
- Returns config object for use in server

### ✅ `server/lib/supabase.ts` - Supabase Client
- Uses config from `server/config.ts`
- Creates service role client for backend operations
- Currently initialized but pointing to placeholder URL at runtime

---

## Summary

**Current State**: 
- ✅ Code is correctly implemented with normalization and error logging
- ✅ All endpoints registered and wired
- ⚠️ Runtime environment has stale placeholder values
- ⚠️ Text normalization missing space reduction and case harmonization

**Blockers**:
- Dev server must be restarted to pick up `.env` file
- After restart, all endpoints should work correctly

**Next Actions**:
1. Restart dev server (user action required)
2. Verify connection with `/api/diagnostics/supabase`
3. Enhance text normalization functions
4. Run comprehensive end-to-end tests
