# User Action Checklist - Supabase & Normalization Implementation

## 🎯 Phase 1: Prepare Environment (IMMEDIATE)

### Step 1: Restart Dev Server
- [ ] Click [DevServerRestart](#dev-server-restart) button or equivalent UI control
- [ ] Wait for dev server to fully restart (30-60 seconds)
- [ ] Verify dev server logs show new startup message
- [ ] Expected log output should include environment variable load

**Why**: The current dev server process has stale placeholder Supabase credentials. Restarting forces it to reload `.env` file with real credentials.

### Step 2: Verify Connection
- [ ] Open browser dev tools (F12)
- [ ] Navigate to: `https://your-dev-host/api/diagnostics/supabase`
- [ ] Should see JSON response:
  ```json
  {
    "status": "success",
    "message": "Supabase connection is working",
    "config": {
      "url": "https://hwglhastcmqgrvvxmaae.supabase.co",
      "hasServiceRoleKey": true,
      "hasAnonKey": true
    }
  }
  ```
- [ ] If you see `"status": "error"`, server did not load real credentials
  - Retry: Restart server again
  - Check: Is `.env` file present in root directory?
  - Check: Does `.env` contain real Supabase values?

---

## 🧪 Phase 2: Basic Functionality Tests

### Test 1: Phone Normalization in Registration
- [ ] Navigate to `/register` page
- [ ] **Step 1 - Personal Information**:
  - [ ] First Name: Enter `"  John  "` (with spaces)
  - [ ] Last Name: Enter `"  Smith  "` (with spaces)
  - [ ] Phone: Enter `"06 66 94 71 66"` (spaced format)
  - [ ] Birth Date: Pick any date
  - [ ] Gender: Select any option
  - [ ] Click "Next" or "Continue"

- [ ] **Verify Network Request**:
  - [ ] Open DevTools Network tab (F12 → Network)
  - [ ] Scroll to POST request to `/api/auth/register`
  - [ ] Click on request → "Request" tab
  - [ ] Scroll to body and verify:
    ```json
    {
      "first_name": "John",        // ✅ No spaces
      "last_name": "Smith",        // ✅ No spaces
      "user_phone": "0666947166",  // ✅ No spaces, standard format
      ...
    }
    ```
  - [ ] If you see spaces preserved, something failed - check server console

### Test 2: Text Field Normalization
- [ ] Navigate back to `/register`
- [ ] **Step 1 - Try different spacing**:
  - [ ] First Name: `"  Jean   Paul  "` (multiple spaces, leading/trailing)
  - [ ] Last Name: `"  Dupont  "`
  - [ ] Proceed through form
  - [ ] Verify in Network tab: should show `"first_name": "Jean Paul"` (single spaces)

### Test 3: Phone Formats
- [ ] Navigate to `/register`
- [ ] Try different phone formats in "Personal Phone" field:
  - [ ] Test 1: `"06 66 94 71 66"` (spaced)
  - [ ] Test 2: `"0666947166"` (no spaces)
  - [ ] Test 3: `"+212 666 947 166"` (international)
  - [ ] Test 4: `"666947166"` (9 digits, no leading 0)
  - [ ] All should normalize to: `"0666947166"`

### Test 4: Invalid Phone Rejection
- [ ] Navigate to `/register`
- [ ] **Step 1**: Personal Phone: Enter `"0466947166"` (invalid prefix 04)
- [ ] Try to proceed
- [ ] Expected: Error message in Arabic about invalid phone format
- [ ] Should NOT proceed to next step

---

## 📊 Phase 3: Complete Registration Test

### Full Registration Flow
- [ ] Navigate to `/register`
- [ ] Complete all 5 steps with test data
- [ ] **Use these test values**:
  - First Name: `"Test User"`
  - Last Name: `"Registration"`
  - Phone: `"0666666666"`
  - Birth Date: `"1990-01-01"`
  - Gender: Male
  - Patrol: Any
  - Role: Any
  - Guardian: Same as yourself
  - Additional: Any
  - Password: `"TestPassword123"`

- [ ] On Step 5, submit registration
- [ ] Should see success message or redirect to account confirmation
- [ ] **Verify in Database**:
  - [ ] Go to Supabase dashboard
  - [ ] Open "users" table
  - [ ] Find newly registered user
  - [ ] Verify fields:
    - [ ] `first_name`: No extra spaces ✅
    - [ ] `last_name`: No extra spaces ✅
    - [ ] `user_phone`: Format is `0XXXXXXXXX` ✅
    - [ ] No spaces or formatting in phone ✅

---

## 🔐 Phase 4: Login Test

### Test Login with Normalized Data
- [ ] Wait for registration to complete
- [ ] Note the Member ID (generated_id) from confirmation page
- [ ] Navigate to `/login`
- [ ] **Login with registered user**:
  - First Name: `"Test User"`
  - Last Name: `"Registration"`
  - Member ID: Use the generated ID
  - Password: `"TestPassword123"`

- [ ] Expected: Should login successfully
- [ ] Should be redirected to dashboard/home page

### Test Login with Format Variations
- [ ] Go back to `/login`
- [ ] Try login with name variations:
  - [ ] First Name: `"  Test User  "` (with spaces)
  - [ ] Last Name: `"  Registration  "` (with spaces)
  - [ ] Member ID: `"  SHM001  "` (if applicable)
  - [ ] Password: Keep exact same
  
- [ ] Expected: Should still login successfully
- [ ] Normalization should make the match work

---

## 🔑 Phase 5: Password Recovery Test

### Identity Verification Flow
- [ ] Navigate to `/forgot-password`
- [ ] **Step 1 - Verify Identity**:
  - [ ] First Name: `"Test User"`
  - [ ] Last Name: `"Registration"`
  - [ ] Phone: `"06 66 66 66 66"` (try spaced format)
  - [ ] Birth Date: Same as registered
  - [ ] Member ID: From registration
  - [ ] Click "Verify"

- [ ] Expected: Should find user and show password
- [ ] **Verify Network**: Phone should be normalized before query

### Test with Different Phone Format
- [ ] Try password recovery again with:
  - [ ] Phone: `"+212666666666"` (international format)
  
- [ ] Expected: Should still find the user
- [ ] Normalization on both sides should match

---

## 🔍 Phase 6: Database Verification

### Run Verification Queries
Open Supabase dashboard → SQL Editor and run these queries:

#### Query 1: Check Phone Format Normalization
```sql
SELECT id, first_name, last_name, user_phone 
FROM users 
WHERE id = (SELECT MAX(id) FROM users)
LIMIT 1;
```
- [ ] Verify `user_phone` is in format `0XXXXXXXXX`
- [ ] No spaces, dashes, or `+212` prefix
- [ ] Should match: `0666666666`

#### Query 2: Find Names with Multiple Spaces
```sql
SELECT id, first_name, last_name 
FROM users 
WHERE first_name LIKE '%  %' 
  OR last_name LIKE '%  %';
```
- [ ] Expected: **0 results** (no multiple spaces)
- [ ] If results found: Normalization not working properly

#### Query 3: Find Names with Leading/Trailing Spaces
```sql
SELECT id, first_name, last_name 
FROM users 
WHERE first_name LIKE ' %' 
  OR first_name LIKE '% '
  OR last_name LIKE ' %' 
  OR last_name LIKE '% ';
```
- [ ] Expected: **0 results** (no leading/trailing spaces)
- [ ] If results found: Trimming not working properly

#### Query 4: Check Guardian Phone Normalization
```sql
SELECT id, guardian_first_name, father_phone, mother_phone, home_phone 
FROM users 
WHERE id = (SELECT MAX(id) FROM users);
```
- [ ] All phone fields should be `0XXXXXXXXX` format
- [ ] Or NULL if not provided

---

## 📋 Phase 7: Error Logging Verification

### Monitor Server Logs
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Perform these actions and watch for logs:

#### Action 1: Failed Login (Wrong Password)
- [ ] Go to `/login`
- [ ] Enter correct name/ID but wrong password
- [ ] Try to login
- [ ] Expected logs in console:
  ```
  [timestamp] POST /api/auth/login
  ⚠️ Login attempt - incorrect password for user: SHM001
  ```

#### Action 2: Failed Login (User Not Found)
- [ ] Go to `/login`
- [ ] Enter incorrect name
- [ ] Try to login
- [ ] Expected logs:
  ```
  [timestamp] POST /api/auth/login
  ❌ Login failed - user not found: { ... }
  ```

#### Action 3: Successful Registration
- [ ] Go to `/register`
- [ ] Complete full registration
- [ ] Expected in console logs:
  ```
  [timestamp] POST /api/auth/register
  ✅ Registration successful - User: [user-id]
  ```

---

## 📱 Phase 8: Edge Cases Testing

### Test 1: Non-Breaking Spaces
- [ ] Copy this text (contains non-breaking space U+00A0): `"test​test"`
- [ ] Paste into a name field on register
- [ ] Submit form
- [ ] Check Network/Database: Should be handled gracefully

### Test 2: Multiple Phone Formats in One User
- [ ] Register with: `"+212 666 123 456"`
- [ ] Later try password recovery with: `"06 66 12 34 56"`
- [ ] Expected: Both normalize to same `0666123456`, should match

### Test 3: Arabic Names
- [ ] Register with names: `"محمد علي"` (Muhammad Ali)
- [ ] With extra spaces: `"محمد  علي"` (double space)
- [ ] Should normalize to: `"محمد علي"` (single space)
- [ ] Verify in database with Arabic text preserved

### Test 4: Names with Numbers
- [ ] First Name: `"Jean2"`
- [ ] Last Name: `"Smith3"`
- [ ] Should store as-is (only spaces normalized)
- [ ] Verify: `"Jean2"` and `"Smith3"`

---

## ✅ Phase 9: Final Verification Checklist

### Functionality
- [ ] Registration works end-to-end
- [ ] Login works with normalized data
- [ ] Password recovery finds users
- [ ] All data appears in database
- [ ] Normalization removes spaces
- [ ] Phones convert to standard format

### Error Handling
- [ ] Invalid phones rejected with error message
- [ ] Missing fields rejected with error message
- [ ] Error messages appear in console logs
- [ ] Request logs show all API calls
- [ ] Success logs show completed operations

### Data Quality
- [ ] No spaces in stored names (except between words)
- [ ] No multiple consecutive spaces
- [ ] Phone numbers in `0XXXXXXXXX` format
- [ ] No non-breaking characters in storage
- [ ] Database shows clean, consistent data

### Performance
- [ ] Page loads quickly
- [ ] API responses under 500ms
- [ ] No console errors or warnings
- [ ] No performance degradation

---

## 🆘 Phase 10: Troubleshooting

### Issue: "TypeError: fetch failed" on register
```
Cause: Server still has placeholder Supabase credentials
Solution: Restart dev server and verify /api/diagnostics/supabase
```
- [ ] Restart dev server
- [ ] Test `/api/diagnostics/supabase` endpoint
- [ ] Should show real Supabase URL, not placeholder

### Issue: User not found during login
```
Cause: Names not normalized, or user not registered
Solution: 
  1. Verify user actually registered (check database)
  2. Ensure names match exactly (after normalization)
  3. Try with exact same name as registered
```
- [ ] Check Supabase users table - is user there?
- [ ] Copy exact first_name, last_name from database
- [ ] Try login with those exact values

### Issue: "Invalid phone number" error on register
```
Cause: Phone prefix is not Moroccan (06-09, 05)
Solution: Use valid Moroccan phone starting with these prefixes
```
- [ ] Verify phone starts with: 06, 07, 08, 09, or 05
- [ ] Check you're not using: 01, 02, 03, 04
- [ ] Try: 0666666666 (guaranteed valid)

### Issue: Spaces still in database
```
Cause: 
  - Backend code not reloaded (restart needed)
  - Normalization function not being called
Solution: Restart server and verify normalize Text() is imported
```
- [ ] Restart dev server
- [ ] Check: grep normalizeText client/pages/Register.tsx
- [ ] Check: grep normalizeText server/routes/auth.ts
- [ ] Verify imports are correct

### Issue: Logs not appearing in console
```
Cause: Browser console not opened, or logs going elsewhere
Solution: 
  - Open DevTools: F12 or right-click → Inspect
  - Go to Console tab (not Network)
  - Refresh page and try action again
```
- [ ] Open DevTools (F12)
- [ ] Click Console tab
- [ ] Clear logs (Ctrl+L)
- [ ] Try login/register action
- [ ] Watch for logs

---

## 📝 Phase 11: Document Review

### Review Implementation Documentation
- [ ] Read `QUICK_REFERENCE.md` (5 min) - Overview
- [ ] Read `SUPABASE_CONNECTION_AUDIT.md` (10 min) - Technical details
- [ ] Read `NORMALIZATION_TEST_GUIDE.md` (15 min) - Test cases
- [ ] Read `DATA_FLOW_DIAGRAM.txt` (10 min) - Visual flow
- [ ] Read `IMPLEMENTATION_SUMMARY_SESSION_2.md` (15 min) - Complete summary

### Understand Code Changes
- [ ] View `shared/utils.ts` - New `normalizeText()` function
- [ ] View `server/routes/auth.ts` - How normalization is applied
- [ ] View `client/pages/Register.tsx` - Frontend normalization
- [ ] View `server/index.ts` - Request logging middleware

---

## 🎓 Phase 12: Team Knowledge Transfer

### Share with Team
- [ ] Send them `QUICK_REFERENCE.md` for overview
- [ ] Send them `NORMALIZATION_TEST_GUIDE.md` for testing
- [ ] Share key functions location: `shared/utils.ts`
- [ ] Show them logs in console (✅❌⚠️ symbols)

### Document for Future Development
- [ ] When adding new text fields → use `normalizeText()`
- [ ] When adding new phone fields → use `normalizePhoneNumber()`
- [ ] Apply normalization on BOTH frontend and backend
- [ ] Add request/error logging using console methods shown

---

## 🎉 Success Criteria

You'll know everything is working when:

- [x] ✅ `/api/diagnostics/supabase` returns success
- [x] ✅ Can register new user with various name/phone formats
- [x] ✅ Database shows normalized data (no extra spaces)
- [x] ✅ Phone numbers all in `0XXXXXXXXX` format
- [x] ✅ Can login with slightly different name format
- [x] ✅ Server logs show requests and responses
- [x] ✅ Error messages appear for invalid input
- [x] ✅ No console JavaScript errors

---

## 📞 Support Resources

| Issue | Document |
|-------|----------|
| Connection problems | `SUPABASE_CONNECTION_AUDIT.md` |
| Testing & validation | `NORMALIZATION_TEST_GUIDE.md` |
| Data flow understanding | `DATA_FLOW_DIAGRAM.txt` |
| Quick overview | `QUICK_REFERENCE.md` |
| Complete summary | `IMPLEMENTATION_SUMMARY_SESSION_2.md` |

---

## 🔄 Next Steps After Verification

Once all tests pass:

1. **Document Results**: Note any issues found and fixed
2. **Code Review**: Review changes in Git diff
3. **Merge Changes**: If using feature branch, merge to main
4. **Announce**: Let team know normalization is live
5. **Monitor**: Watch logs for normalization edge cases
6. **Plan Enhancements**: Consider deduplication, Unicode normalization

---

**Checklist Version**: 1.0  
**Last Updated**: 2026-07-11  
**Status**: Ready to Execute  

✅ **NEXT ACTION: Restart dev server and begin Phase 1**
