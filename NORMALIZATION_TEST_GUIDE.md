# Data Normalization & Validation Test Guide

## Overview
This guide provides comprehensive test cases for validating phone number normalization and text field cleaning implementations.

---

## Part 1: Phone Number Normalization Tests

### Test Function: `normalizePhoneNumber()`
**Location**: `shared/utils.ts:28-67`

### Test Cases

#### ✅ Valid Format Tests

| Input | Expected Output | Test Status |
|-------|-----------------|------------|
| `"0666947166"` | `"0666947166"` | Should Pass |
| `"06 66 94 71 66"` | `"0666947166"` | Should Pass |
| `"06-66-94-71-66"` | `"0666947166"` | Should Pass |
| `"(206) 66-94-71-66"` | `"0266947166"` | Should Pass |
| `"+212666947166"` | `"0666947166"` | Should Pass |
| `"+212 666 947 166"` | `"0666947166"` | Should Pass |
| `"00212666947166"` | `"0666947166"` | Should Pass |
| `"212666947166"` | `"0666947166"` | Should Pass |
| `"666947166"` | `"0666947166"` | Should Pass |
| `"0766947166"` | `"0766947166"` | Should Pass (07 prefix) |
| `"0866947166"` | `"0866947166"` | Should Pass (08 prefix) |
| `"0966947166"` | `"0966947166"` | Should Pass (09 prefix) |
| `"0566947166"` | `"0566947166"` | Should Pass (05 prefix) |
| `" 06 66 94 71 66 "` | `"0666947166"` | Should Pass (with outer spaces) |

#### ❌ Invalid Format Tests

| Input | Expected Output | Reason |
|-------|-----------------|--------|
| `"0466947166"` | `null` | Invalid prefix (04) |
| `"0166947166"` | `null` | Invalid prefix (01) |
| `"0366947166"` | `null` | Invalid prefix (03) |
| `"1234567890"` | `null` | Invalid prefix (12) |
| `"123"` | `null` | Too short |
| `"06669471661234"` | `null` | Too long |
| `"+33666947166"` | `null` | French number (wrong country code) |
| `"+44666947166"` | `null` | UK number (wrong country code) |
| `""` | `null` | Empty string |
| `null` | `null` | Null input |
| `undefined` | `null` | Undefined input |
| `"abcdefghij"` | `null` | Non-numeric |
| `"06 six nine 71 66"` | `null` | Text mixed with numbers |

---

## Part 2: Text Normalization Tests

### Test Functions
- `normalizeText()` - Trim + reduce spaces + remove control chars
- `trimString()` - Trim only (legacy, still used for passwords)

### Location: `shared/utils.ts:78-105`

### Test Cases: normalizeText()

#### ✅ Valid Text Normalization

| Input | Expected Output | Notes |
|-------|-----------------|-------|
| `"John"` | `"John"` | Simple name |
| `" John "` | `"John"` | Leading/trailing spaces |
| `"  John  "` | `"John"` | Multiple leading/trailing |
| `"John Doe"` | `"John Doe"` | Name with space |
| `"John   Doe"` | `"John Doe"` | Multiple internal spaces |
| `"John    Doe    Smith"` | `"John Doe Smith"` | Multiple multi-space sections |
| `"محمد علي"` | `"محمد علي"` | Arabic names |
| `"محمد  علي"` | `"محمد علي"` | Arabic with multiple spaces |
| `"Jean-Paul"` | `"Jean-Paul"` | Hyphenated name (preserved) |
| `"O'Brien"` | `"O'Brien"` | Name with apostrophe (preserved) |
| `"  Jean   Paul  "` | `"Jean Paul"` | Combination of all above |
| `"test@example.com"` | `"test@example.com"` | Email address |
| `"test  @  example.com"` | `"test @ example.com"` | Email with extra spaces |
| `"123 Main St"` | `"123 Main St"` | Address |
| `"  123   Main   St  "` | `"123 Main St"` | Address with extra spaces |
| `""` | `""` | Empty string |
| `"   "` | `""` | Only spaces |
| `"\u00A0test\u00A0"` | `"test"` | Non-breaking spaces (U+00A0) |
| `"test\u00A0\u00A0words"` | `"test words"` | Multiple non-breaking spaces |

#### ⚠️ Special Cases

| Input | Expected Output | Behavior |
|-------|-----------------|----------|
| `"password with spaces"` | Should NOT use normalizeText | Use `trimString()` instead for passwords |
| `"123456789"` | `"123456789"` | Pure numbers (fine to normalize) |
| `"test\nline"` | `"test line"` | Newline converted to space (control char) |
| `"test\ttab"` | `"test tab"` | Tab converted to space |

---

## Part 3: Integration Test Scenarios

### Scenario 1: User Registration with Various Input Formats

**Test**: Register a new user with multiple spacing/formatting variations

```javascript
// Frontend sends
const formData = {
  firstName: "  Jean   Paul  ",
  lastName: "  Dupont  ",
  userPhone: "06  66  94  71  66",
  fatherPhone: "+212 666 947 166",
  // ... rest of fields
};

// Expected at backend
const stored = {
  first_name: "Jean Paul",        // Normalized
  last_name: "Dupont",            // Normalized
  user_phone: "0666947166",       // Normalized
  father_phone: "0666947166",     // Normalized
};

// Expected in database (after INSERT)
// All fields normalized and deduplicated if needed
```

### Scenario 2: Login with Mixed Formats

**Test**: User logs in with variations of their stored name

```javascript
// User stores: "first_name": "John Doe", "generated_id": "SHM001"
// During login attempt:

// Attempt 1: "John    Doe" (multiple spaces)
// Should match: normalizeText("John    Doe") === "John Doe" ✅

// Attempt 2: "  John Doe  " (leading/trailing)
// Should match: normalizeText("  John Doe  ") === "John Doe" ✅

// Attempt 3: "john doe" (lowercase)
// Should NOT match: no case normalization (not implemented)
// This is expected behavior
```

### Scenario 3: Password Recovery with Phone Matching

**Test**: Password recovery matches user by normalized phone

```javascript
// Database has: user_phone: "0666947166"

// Recovery attempt with: userPhone: "06 66 94 71 66"
// Normalized: normalizePhoneNumber("06 66 94 71 66") === "0666947166" ✅
// Database lookup: .eq("user_phone", "0666947166") ✅
// Should find the user
```

### Scenario 4: Deduplication Check

**Test**: System prevents duplicate registration with same normalized phone

```javascript
// User A registered: phone: "0666947166"
// User B attempts registration: phone: "+212666947166"

// Both normalize to: "0666947166"
// System should:
// Option A: Reject registration (not yet implemented)
// Option B: Check before insert (not yet implemented)
// Current: Both stored separately (gap in implementation)
```

---

## Part 4: Edge Cases & Unicode Handling

### Control Characters

```javascript
// Null bytes, DEL, etc. should be stripped
normalizeText("test\x00string") === "teststring" // Control char removed
normalizeText("test\x7Fstring") === "teststring" // DEL char removed

// Valid but unusual Unicode
normalizeText("café")  === "café"  // Accents preserved
normalizeText("tëst")  === "tëst"  // Diaeresis preserved
normalizeText("café  ")  === "café" // With normalization
```

### Whitespace Variants

```javascript
// Regular space (U+0020)
normalizeText("a b") === "a b"

// Non-breaking space (U+00A0)
normalizeText("a\u00A0b") === "a b" // Converted to regular space

// Tab (U+0009) - control character
normalizeText("a\tb") === "a b" // Converted to regular space

// Newline (U+000A) - control character
normalizeText("a\nb") === "a b" // Converted to regular space

// Zero-width space (U+200B) - NOT removed (not a control char)
normalizeText("a\u200Bb") === "a\u200Bb" // Preserved (invisible)
```

---

## Part 5: Manual Testing Checklist

### Prerequisites
- [ ] Dev server running with real Supabase credentials
- [ ] `/api/diagnostics/supabase` returning success
- [ ] Browser console open (F12)
- [ ] Network tab visible to monitor API calls

### Test Case 1: Phone Normalization in Register Form
- [ ] Open `/register` page
- [ ] Step 1: Fill "Your Phone" with `"06 66 94 71 66"` (spaced format)
- [ ] Submit registration
- [ ] Check Network tab: POST body should have `"user_phone": "0666947166"`
- [ ] Check database (Supabase): `user_phone` should be `"0666947166"` (no spaces)

### Test Case 2: Multiple Spaces in Names
- [ ] Open `/register` page
- [ ] Step 1: Fill "First Name" with `"  Jean   Paul  "`
- [ ] Step 1: Fill "Last Name" with `"  Dupont  "`
- [ ] Submit to Step 2
- [ ] Complete registration
- [ ] Check Network tab: POST body should have:
  - `"first_name": "Jean Paul"` (single spaces)
  - `"last_name": "Dupont"` (trimmed)
- [ ] Verify in Supabase: names should be normalized

### Test Case 3: Login with Different Format
- [ ] Register user with: first_name = "John", last_name = "Smith"
- [ ] Go to `/login` page
- [ ] Attempt login with: first_name = `"  John  "`, last_name = `"Smith"`
- [ ] Expected: Should normalize to match and login successfully
- [ ] Check server logs: `✅ Login successful` message

### Test Case 4: Password Recovery Phone Matching
- [ ] Go to `/forgot-password` page
- [ ] Enter user's phone in different format than stored
  - Stored: `"0666947166"`
  - Enter: `"+212 666 947 166"`
- [ ] Other fields: correct first_name, last_name, birth_date, member_id
- [ ] Submit verify
- [ ] Expected: Should find user and show password (or email it)
- [ ] Check Network tab: POST body should have `"userPhone": "0666947166"`

### Test Case 5: International Phone Format
- [ ] Open `/register`
- [ ] Step 1: Enter personal phone as `"+212 6 6694 71 66"` (international format)
- [ ] Submit registration
- [ ] Check Network/Database: Should normalize to `"0666947166"`
- [ ] Verify success message

### Test Case 6: Invalid Phone Numbers Rejected
- [ ] Open `/register`
- [ ] Step 1: Enter personal phone as `"0466947166"` (invalid 04 prefix)
- [ ] Try to proceed/submit
- [ ] Expected: Error message in Arabic about invalid phone
- [ ] Check browser console: Should see validation error

### Test Case 7: Non-Breaking Space Handling
- [ ] Copy-paste this into first name field: `"test​test"` (contains U+200B zero-width space)
- [ ] Submit registration
- [ ] This tests if invisible characters are being handled
- [ ] Monitor console for any warnings

---

## Part 6: Database Verification Queries

### Check Normalized Phone Numbers in Database

```sql
-- View all user phone numbers (should all be format 0XXXXXXXXX)
SELECT id, first_name, last_name, user_phone FROM users;

-- Find users with spaces in phone (should be 0 results)
SELECT id, user_phone FROM users WHERE user_phone LIKE '% %';

-- Find users with invalid prefixes (should be 0 results)
SELECT id, user_phone FROM users 
WHERE user_phone NOT LIKE '0[5-9]%'
  AND user_phone NOT LIKE '+212%';

-- Check for duplicate phones (same normalized)
SELECT user_phone, COUNT(*) as count FROM users 
GROUP BY user_phone HAVING count > 1;
```

### Check Normalized Names in Database

```sql
-- Find names with multiple spaces (should be 0 results)
SELECT id, first_name, last_name FROM users 
WHERE first_name LIKE '%  %' OR last_name LIKE '%  %';

-- Find names with leading/trailing spaces (should be 0 results)
SELECT id, first_name, last_name FROM users 
WHERE first_name LIKE ' %' OR first_name LIKE '% '
  OR last_name LIKE ' %' OR last_name LIKE '% ';

-- View all unique first names (check formatting)
SELECT DISTINCT first_name FROM users ORDER BY first_name;
```

---

## Part 7: Expected Results Summary

### After All Implementations

✅ **Phone Normalization**
- [x] All phone formats convert to `0XXXXXXXXX`
- [x] Invalid prefixes rejected at frontend and backend
- [x] Special characters stripped (spaces, dashes, parens)
- [x] International formats converted correctly
- [x] Database contains only canonical format

✅ **Text Normalization**
- [x] Leading/trailing spaces removed
- [x] Multiple internal spaces reduced to single space
- [x] Control characters stripped
- [x] Non-breaking spaces handled
- [x] Database contains clean text

✅ **Error Logging**
- [x] All errors logged to console with timestamps
- [x] Request logging middleware shows all endpoints accessed
- [x] Detailed error messages in responses
- [x] Connection diagnostics available

✅ **Data Integrity**
- [x] Normalization applied on both frontend and backend
- [x] Frontend for UX feedback
- [x] Backend for system-level integrity
- [x] Passwords preserved (not normalized)

---

## Part 8: Known Limitations & Future Enhancements

### Current Limitations
1. ⚠️ **No Case Normalization** - Names stored as entered (John vs JOHN)
   - Could implement: Title case for names, lowercase for emails
   - Risk: May conflict with user intent (some names intentionally uppercase)

2. ⚠️ **No Deduplication Check** - Same person can register twice with different phone formats
   - Recommended: Add `.eq("user_phone", normalized)` before insert
   - Would need deduplication migration for existing data

3. ⚠️ **Password Format Preserved** - Passwords NOT normalized (preserves spacing)
   - This is correct behavior (preserve user's literal password)

4. ⚠️ **No Arabic Text Normalization** - No NFD/NFC Unicode normalization
   - May cause matching issues if user mixes Unicode forms
   - Recommended: Add `normalize('NFC')` for all text fields

### Recommended Future Enhancements

```typescript
// For Arabic/International text
export function normalizeUnicode(text: string): string {
  return text.normalize('NFC'); // Normalize Unicode composition
}

// For deduplication
async function checkDuplicatePhone(phone: string) {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("user_phone", phone)
    .limit(1);
  return data && data.length > 0;
}

// For case normalization (optional)
export function normalizeName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
```

---

## Part 9: Testing Troubleshooting

### Issue: Tests Failing After Deployment

**Cause**: Dev server not reloaded with `.env` changes

**Solution**:
```bash
# Restart dev server to reload environment variables
# User needs to use UI [DevServerRestart](#dev-server-restart) button
```

### Issue: Phone Not Normalizing in Database

**Cause**: Backend may not have been restarted

**Check**:
1. Verify `/api/diagnostics/supabase` returns success
2. Check server logs for error messages
3. Monitor `/api/auth/register` request/response in Network tab

### Issue: Text Not Normalizing

**Cause**: `normalizeText()` not exported or imported correctly

**Check**:
```bash
# Verify export in shared/utils.ts
grep "export.*normalizeText" shared/utils.ts

# Verify import in pages
grep "normalizeText" client/pages/*.tsx
```

### Issue: Cannot Find User During Login

**Cause**: Names not being normalized on lookup

**Check**:
1. In Register: verify names stored normalized
2. In Login: verify input names normalized
3. Database: verify stored names have no extra spaces

---

## Summary Checklist

- [ ] Phone normalization function implemented and exported
- [ ] Text normalization function implemented and exported
- [ ] All form pages import and use normalization functions
- [ ] Backend routes import and use normalization functions
- [ ] TypeScript compilation succeeds
- [ ] No runtime errors in browser console
- [ ] Manual test cases pass
- [ ] Database verification queries show normalized data
- [ ] Error logging visible in server console
- [ ] `/api/diagnostics/supabase` endpoint working

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-11  
**Implementation Status**: ✅ Complete & Ready for Testing
