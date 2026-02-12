# 🧪 Testing Guide - eNoah Timesheet Application

## Complete Test Scenarios for All Validations

---

## 🎯 Test Setup

### Prerequisites
- Access to the timesheet application
- Valid eNoah email address
- Google Sheets with proper permissions
- Test date: Use dates in February 2026 for consistency

### Test User
- Email: test.user@enoahisolution.com
- Role: Regular user

---

## 📋 Test Case 1: Leave Entry in Sheet1

### Objective
Verify that leave entries are properly inserted in both Sheet1 and Leave sheet.

### Steps
1. Login to the application
2. Click "Leave" button
3. Fill in leave details:
   - Leave Type: Sick Leave
   - Session: Full Day (8 hrs)
   - From Date: 18/02/2026
   - To Date: 18/02/2026
   - Description: "Feeling unwell"
4. Click "Submit"

### Expected Results
✅ Success toast message appears
✅ Form resets after submission
✅ Check Sheet1: Entry exists with:
   - Timestamp
   - Email
   - Leave Type: Sick Leave
   - Session: Full Day (8 hrs)
   - Hours Spent: 8
   - From Date: 18/02/2026
   - To Date: 18/02/2026
✅ Check Leave sheet: Entry exists with:
   - Submitted Date
   - Email ID
   - From Date: 18/02/2026
   - To Date: 18/02/2026
   - Day Count: 1
   - Leave Type: Sick Leave
   - Session: Full Day (8 hrs)
   - Description: "Feeling unwell"

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 2: View Entries with DataTables

### Objective
Verify that View Entries displays data correctly with DataTables features.

### Steps
1. Login to the application
2. Submit at least 15 entries (mix of work and leave)
3. Click "View Entries" button
4. Observe the modal

### Expected Results
✅ Modal opens with DataTable
✅ Pagination shows (if > 10 entries)
✅ Search box is visible
✅ Entry type filter dropdown is visible
✅ All columns are sortable (click headers)
✅ Data is sorted by date (newest first)
✅ Work entries show: Date, Type (Work badge), Project, Task, Hours, Description
✅ Leave entries show: Date range, Type (Leave badge), Leave Type, Session, Days, Description

### Test Pagination
1. Click "Next" button → Should show next 10 entries
2. Click "Previous" button → Should go back
3. Click page numbers → Should jump to that page

### Test Search
1. Type project name → Should filter to matching entries
2. Type date → Should show entries for that date
3. Clear search → Should show all entries

### Test Sorting
1. Click "Date" header → Should sort by date
2. Click again → Should reverse sort
3. Click "Hours/Days" → Should sort numerically

### Test Filter
1. Select "Work Only" → Should show only work entries
2. Select "Leave Only" → Should show only leave entries
3. Select "All Entries" → Should show everything

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 3: Leave vs Timesheet Conflict (Validation 1)

### Objective
Verify that work entry is blocked if leave exists for that date.

### Setup
1. Submit a leave entry for 18/02/2026 (Full Day)

### Test Steps
1. Click "Work" button
2. Select Date: 18/02/2026
3. Add a timesheet row:
   - Project: Project 1
   - Task: Development
   - Billing Type: Billable
   - Description: "Working on feature"
   - Hours: 8
4. Click "Submit"

### Expected Results
❌ Error toast appears: "Timesheet cannot be submitted. Leave already applied for this date."
❌ Form is NOT submitted
❌ No new entry in Sheet1
✅ User can correct the date and resubmit

### Additional Tests
- Try with Half Day leave → Should still block work entry
- Try with date range leave (15-17 Feb) → Should block work on 16 Feb
- Try work on different date (19 Feb) → Should succeed

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 4: Partial Leave Hour Restriction (Validation 2)

### Objective
Verify that total hours (leave + work) cannot exceed 8 hours per day.

### Scenario A: Half Day Leave + Full Work (Should Fail)

#### Setup
1. Submit Half Day leave for 13/02/2026 (4 hours)

#### Test Steps
1. Click "Work" button
2. Select Date: 13/02/2026
3. Add timesheet rows totaling 8 hours:
   - Row 1: Project 1, 4 hours
   - Row 2: Project 2, 4 hours
4. Click "Submit"

#### Expected Results
❌ Error toast: "Total hours exceed allowed limit. You have 4 hours already logged (including leave). Remaining: 4 hours."
❌ Form is NOT submitted
❌ No new entry in Sheet1

#### Status: [ ] Pass [ ] Fail

---

### Scenario B: Half Day Leave + Partial Work (Should Succeed)

#### Setup
1. Submit Half Day leave for 14/02/2026 (4 hours)

#### Test Steps
1. Click "Work" button
2. Select Date: 14/02/2026
3. Add timesheet rows totaling 4 hours:
   - Row 1: Project 1, 2 hours
   - Row 2: Project 2, 2 hours
4. Click "Submit"

#### Expected Results
✅ Success toast: "Entry submitted successfully!"
✅ Form is submitted
✅ New entries appear in Sheet1
✅ Total hours for 14/02/2026 = 8 (4 leave + 4 work)

#### Status: [ ] Pass [ ] Fail

---

### Scenario C: Multiple Work Entries Exceeding Limit (Should Fail)

#### Setup
1. Submit work entry for 15/02/2026 with 6 hours

#### Test Steps
1. Try to submit another work entry for 15/02/2026 with 3 hours
2. Click "Submit"

#### Expected Results
❌ Error toast: "Total hours exceed allowed limit. You have 6 hours already logged (including leave). Remaining: 2 hours."
❌ Form is NOT submitted

#### Status: [ ] Pass [ ] Fail

---

### Scenario D: Work Within Remaining Hours (Should Succeed)

#### Setup
1. Submit work entry for 16/02/2026 with 3 hours

#### Test Steps
1. Submit another work entry for 16/02/2026 with 5 hours
2. Click "Submit"

#### Expected Results
✅ Success toast appears
✅ Form is submitted
✅ Total hours for 16/02/2026 = 8 (3 + 5)

#### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 5: Overlapping Leave Prevention

### Objective
Verify that overlapping leave entries are blocked.

### Scenario A: Exact Date Overlap (Should Fail)

#### Setup
1. Submit leave for 20/02/2026

#### Test Steps
1. Try to submit another leave for 20/02/2026
2. Click "Submit"

#### Expected Results
❌ Error toast: "Leave already applied for overlapping dates. Please check your existing leave entries."
❌ Form is NOT submitted

#### Status: [ ] Pass [ ] Fail

---

### Scenario B: Date Range Overlap (Should Fail)

#### Setup
1. Submit leave from 15/02/2026 to 17/02/2026

#### Test Steps
1. Try to submit leave from 16/02/2026 to 18/02/2026
2. Click "Submit"

#### Expected Results
❌ Error toast: "Leave already applied for overlapping dates."
❌ Form is NOT submitted

#### Status: [ ] Pass [ ] Fail

---

### Scenario C: Non-Overlapping Dates (Should Succeed)

#### Setup
1. Submit leave from 10/02/2026 to 12/02/2026

#### Test Steps
1. Submit leave from 15/02/2026 to 17/02/2026
2. Click "Submit"

#### Expected Results
✅ Success toast appears
✅ Form is submitted
✅ Both leave entries exist in sheets

#### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 6: Complex Scenario Testing

### Scenario: Mixed Entries for Multiple Days

#### Day 1 (10/02/2026)
1. Submit: 8 hours work → ✅ Should succeed
2. Try: Any more work → ❌ Should fail (limit reached)
3. Try: Any leave → ❌ Should fail (work exists)

#### Day 2 (11/02/2026)
1. Submit: Half day leave (4 hours) → ✅ Should succeed
2. Submit: 4 hours work → ✅ Should succeed
3. Try: 1 more hour work → ❌ Should fail (limit reached)

#### Day 3 (12/02/2026)
1. Submit: Full day leave (8 hours) → ✅ Should succeed
2. Try: Any work → ❌ Should fail (leave exists)

#### Day 4 (13/02/2026)
1. Submit: 3 hours work → ✅ Should succeed
2. Submit: 3 hours work → ✅ Should succeed
3. Submit: 2 hours work → ✅ Should succeed
4. Try: 1 more hour → ❌ Should fail (limit reached)

#### Day 5 (14/02/2026)
1. Submit: Leave from 14/02 to 16/02 → ✅ Should succeed
2. Try: Work on 14/02 → ❌ Should fail
3. Try: Work on 15/02 → ❌ Should fail
4. Try: Work on 16/02 → ❌ Should fail
5. Try: Work on 17/02 → ✅ Should succeed (no leave)

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 7: DataTables Features

### Test Search Functionality
1. Enter "Project 1" in search → Should show only Project 1 entries
2. Enter date "02/18/2026" → Should show entries for that date
3. Enter "Leave" → Should show leave entries
4. Clear search → Should show all entries

### Test Sorting
1. Click "Date" column → Should sort ascending
2. Click "Date" again → Should sort descending
3. Click "Hours/Days" → Should sort numerically
4. Click "Type" → Should group by type

### Test Pagination
1. Verify "Showing 1 to 10 of X entries" text
2. Click "Next" → Should show entries 11-20
3. Click "Last" → Should show last page
4. Click "First" → Should return to page 1
5. Click page number → Should jump to that page

### Test Entry Type Filter
1. Select "Work Only" → Should show only work entries
2. Verify pagination updates
3. Verify search works with filter
4. Select "Leave Only" → Should show only leave entries
5. Select "All Entries" → Should show everything

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 8: Error Message Clarity

### Objective
Verify that all error messages are clear and helpful.

### Test Each Error Message

#### Error 1: Leave Conflict
- Trigger: Submit work on leave date
- Expected: "Timesheet cannot be submitted. Leave already applied for this date."
- Clear? [ ] Yes [ ] No

#### Error 2: Hours Exceed Limit
- Trigger: Submit work exceeding 8 hours
- Expected: "Total hours exceed allowed limit. You have X hours already logged (including leave). Remaining: Y hours."
- Shows existing hours? [ ] Yes [ ] No
- Shows remaining hours? [ ] Yes [ ] No
- Clear? [ ] Yes [ ] No

#### Error 3: Overlapping Leave
- Trigger: Submit overlapping leave
- Expected: "Leave already applied for overlapping dates. Please check your existing leave entries."
- Clear? [ ] Yes [ ] No

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 9: Data Integrity

### Objective
Verify data is correctly stored in all sheets.

### Test Work Entry
1. Submit work entry with 8 hours
2. Check Sheet1:
   - ✅ Timestamp present
   - ✅ Email correct
   - ✅ Date correct
   - ✅ Project name present
   - ✅ Task present
   - ✅ Hours = 8
   - ✅ Description present
3. Check Consolidated sheet:
   - ✅ Entry exists
   - ✅ Total hours = 8
   - ✅ Date matches

### Test Leave Entry
1. Submit leave entry
2. Check Sheet1:
   - ✅ Timestamp present
   - ✅ Email correct
   - ✅ Leave type present
   - ✅ Session present
   - ✅ From/To dates correct
   - ✅ Hours = 8 (full) or 4 (half)
3. Check Leave sheet:
   - ✅ Entry exists
   - ✅ Day count correct
   - ✅ All fields present
4. Check Consolidated sheet:
   - ✅ Leave entry NOT present (correct behavior)

### Status: [ ] Pass [ ] Fail

---

## 📋 Test Case 10: Edge Cases

### Test 1: Exactly 8 Hours
- Submit: 8 hours work on fresh date
- Expected: ✅ Success

### Test 2: Just Under 8 Hours
- Submit: 7.5 hours work on fresh date
- Expected: ✅ Success

### Test 3: Just Over 8 Hours
- Setup: 7.5 hours work exists
- Submit: 1 hour work
- Expected: ❌ Fail (total = 8.5)

### Test 4: Multiple Small Entries
- Submit: 2 hours work
- Submit: 2 hours work
- Submit: 2 hours work
- Submit: 2 hours work
- Total: 8 hours
- Expected: ✅ All succeed

### Test 5: Zero Hours
- Submit: 0 hours work
- Expected: ❌ Should fail validation (minimum 0.5 hours)

### Test 6: Negative Hours
- Submit: -2 hours work
- Expected: ❌ Should fail validation

### Test 7: Future Date Leave (Casual)
- Leave Type: Casual Leave
- Date: Future date
- Expected: ✅ Should succeed (casual leave allows future dates)

### Test 8: Future Date Leave (Sick)
- Leave Type: Sick Leave
- Date: Future date
- Expected: ❌ Should fail (sick leave doesn't allow future dates)

### Status: [ ] Pass [ ] Fail

---

## 📊 Test Summary Report

### Test Execution Date: _______________
### Tester Name: _______________

| Test Case | Description | Status | Notes |
|-----------|-------------|--------|-------|
| TC-1 | Leave Entry in Sheet1 | [ ] Pass [ ] Fail | |
| TC-2 | View Entries DataTables | [ ] Pass [ ] Fail | |
| TC-3 | Leave vs Work Conflict | [ ] Pass [ ] Fail | |
| TC-4 | Partial Leave Restriction | [ ] Pass [ ] Fail | |
| TC-5 | Overlapping Leave | [ ] Pass [ ] Fail | |
| TC-6 | Complex Scenarios | [ ] Pass [ ] Fail | |
| TC-7 | DataTables Features | [ ] Pass [ ] Fail | |
| TC-8 | Error Messages | [ ] Pass [ ] Fail | |
| TC-9 | Data Integrity | [ ] Pass [ ] Fail | |
| TC-10 | Edge Cases | [ ] Pass [ ] Fail | |

### Overall Result
- Total Tests: 10
- Passed: ___
- Failed: ___
- Pass Rate: ___%

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Recommendations
1. _______________
2. _______________
3. _______________

---

## 🔍 Debugging Tips

### If validation doesn't work:
1. Check browser console for errors
2. Verify Google Apps Script is deployed
3. Check GOOGLE_SCRIPT_URL in config.js
4. Verify user has proper permissions

### If DataTables doesn't load:
1. Check if jQuery is loaded (console: `typeof jQuery`)
2. Check if DataTables is loaded (console: `typeof $.fn.DataTable`)
3. Verify internet connection (CDN libraries)
4. Check browser console for errors

### If data doesn't appear in sheets:
1. Check Google Apps Script logs
2. Verify sheet names match code
3. Check permissions on Google Sheets
4. Verify data format is correct

---

**Testing Guide Version**: 1.0
**Last Updated**: February 2025
**Status**: Ready for Testing
