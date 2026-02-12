# 🔴 Validation Rules - Quick Reference Guide

## Overview
This document provides a quick reference for all validation rules implemented in the eNoah Timesheet Application.

---

## 🚫 Validation 1: Leave vs Timesheet Conflict

### Rule
**If leave is applied for a date, work entry cannot be submitted for that date.**

### Examples

#### ❌ REJECTED Scenarios
```
Scenario 1:
- User applied: Full Day Leave on 18/02/2026
- User tries: Work entry on 18/02/2026
- Result: ❌ REJECTED
- Error: "Timesheet cannot be submitted. Leave already applied for this date."

Scenario 2:
- User applied: Half Day Leave on 20/02/2026
- User tries: Work entry on 20/02/2026
- Result: ❌ REJECTED
- Error: "Timesheet cannot be submitted. Leave already applied for this date."

Scenario 3:
- User applied: Leave from 15/02/2026 to 17/02/2026
- User tries: Work entry on 16/02/2026
- Result: ❌ REJECTED
- Error: "Timesheet cannot be submitted. Leave already applied for this date."
```

#### ✅ ACCEPTED Scenarios
```
Scenario 1:
- User applied: Leave on 18/02/2026
- User tries: Work entry on 19/02/2026
- Result: ✅ ACCEPTED (different dates)

Scenario 2:
- No leave applied
- User tries: Work entry on any date
- Result: ✅ ACCEPTED
```

---

## 🚫 Validation 2: Partial Leave Hour Restriction

### Rule
**Total hours per day (Leave + Work) cannot exceed 8 hours.**

### Formula
```
Maximum Daily Hours = 8
Existing Hours = Leave Hours + Work Hours
Remaining Hours = 8 - Existing Hours
New Entry Hours ≤ Remaining Hours
```

### Leave Hour Calculation
- **Full Day Leave** = 8 hours
- **Half Day Leave** = 4 hours

### Examples

#### ❌ REJECTED Scenarios
```
Scenario 1: Partial Leave + Full Work
- Date: 13/02/2026
- Existing: 4 hours (Half Day Sick Leave)
- User tries: 8 hours work
- Total: 4 + 8 = 12 hours
- Result: ❌ REJECTED
- Error: "Total hours exceed allowed limit. You have 4 hours already logged (including leave). Remaining: 4 hours."

Scenario 2: Full Leave + Any Work
- Date: 14/02/2026
- Existing: 8 hours (Full Day Leave)
- User tries: 2 hours work
- Total: 8 + 2 = 10 hours
- Result: ❌ REJECTED
- Error: "Timesheet cannot be submitted. Leave already applied for this date."

Scenario 3: Multiple Work Entries Exceeding Limit
- Date: 15/02/2026
- Existing: 6 hours work (already submitted)
- User tries: 3 hours work
- Total: 6 + 3 = 9 hours
- Result: ❌ REJECTED
- Error: "Total hours exceed allowed limit. You have 6 hours already logged (including leave). Remaining: 2 hours."

Scenario 4: Partial Leave + Exceeding Work
- Date: 16/02/2026
- Existing: 4 hours (Half Day Leave)
- User tries: 5 hours work
- Total: 4 + 5 = 9 hours
- Result: ❌ REJECTED
- Error: "Total hours exceed allowed limit. You have 4 hours already logged (including leave). Remaining: 4 hours."
```

#### ✅ ACCEPTED Scenarios
```
Scenario 1: Partial Leave + Remaining Work
- Date: 13/02/2026
- Existing: 4 hours (Half Day Sick Leave)
- User tries: 4 hours work
- Total: 4 + 4 = 8 hours
- Result: ✅ ACCEPTED

Scenario 2: Partial Leave + Less Work
- Date: 14/02/2026
- Existing: 4 hours (Half Day Leave)
- User tries: 3 hours work
- Total: 4 + 3 = 7 hours
- Result: ✅ ACCEPTED

Scenario 3: No Leave + Full Work
- Date: 15/02/2026
- Existing: 0 hours
- User tries: 8 hours work
- Total: 0 + 8 = 8 hours
- Result: ✅ ACCEPTED

Scenario 4: Partial Work + More Work (Within Limit)
- Date: 16/02/2026
- Existing: 3 hours work
- User tries: 5 hours work
- Total: 3 + 5 = 8 hours
- Result: ✅ ACCEPTED

Scenario 5: Partial Work + Partial Work (Within Limit)
- Date: 17/02/2026
- Existing: 2 hours work
- User tries: 4 hours work
- Total: 2 + 4 = 6 hours
- Result: ✅ ACCEPTED
```

---

## 🚫 Validation 3: Overlapping Leave Prevention

### Rule
**User cannot apply leave for dates that already have leave applied.**

### Examples

#### ❌ REJECTED Scenarios
```
Scenario 1: Exact Date Overlap
- Existing: Leave on 20/02/2026
- User tries: Leave on 20/02/2026
- Result: ❌ REJECTED
- Error: "Leave already applied for overlapping dates. Please check your existing leave entries."

Scenario 2: Date Range Overlap
- Existing: Leave from 15/02/2026 to 17/02/2026
- User tries: Leave from 16/02/2026 to 18/02/2026
- Result: ❌ REJECTED
- Error: "Leave already applied for overlapping dates. Please check your existing leave entries."

Scenario 3: Contained Within Existing Leave
- Existing: Leave from 10/02/2026 to 20/02/2026
- User tries: Leave from 12/02/2026 to 15/02/2026
- Result: ❌ REJECTED
- Error: "Leave already applied for overlapping dates. Please check your existing leave entries."

Scenario 4: Containing Existing Leave
- Existing: Leave from 12/02/2026 to 15/02/2026
- User tries: Leave from 10/02/2026 to 20/02/2026
- Result: ❌ REJECTED
- Error: "Leave already applied for overlapping dates. Please check your existing leave entries."
```

#### ✅ ACCEPTED Scenarios
```
Scenario 1: Non-Overlapping Dates
- Existing: Leave from 10/02/2026 to 12/02/2026
- User tries: Leave from 15/02/2026 to 17/02/2026
- Result: ✅ ACCEPTED

Scenario 2: Adjacent Dates (No Overlap)
- Existing: Leave on 10/02/2026
- User tries: Leave on 11/02/2026
- Result: ✅ ACCEPTED

Scenario 3: First Leave Entry
- Existing: No leave
- User tries: Leave on any date
- Result: ✅ ACCEPTED
```

---

## 📊 Validation Flow Chart

```
User Submits Entry
        ↓
Is it a Work Entry?
        ↓
    YES → Check Leave Conflict
            ↓
        Leave exists for this date?
            ↓
        YES → ❌ REJECT: "Leave already applied"
            ↓
        NO → Check Hours Limit
            ↓
        Existing Hours + New Hours > 8?
            ↓
        YES → ❌ REJECT: "Total hours exceed limit"
            ↓
        NO → ✅ ACCEPT & Insert
        
    NO → Is it a Leave Entry?
            ↓
        Check Overlapping Leave
            ↓
        Overlap exists?
            ↓
        YES → ❌ REJECT: "Leave already applied for overlapping dates"
            ↓
        NO → ✅ ACCEPT & Insert in Both Sheets
```

---

## 🎯 Key Points to Remember

### For Users
1. **Cannot submit work if leave exists** for that date
2. **Maximum 8 hours per day** (including leave hours)
3. **Half day leave = 4 hours**, counts towards daily limit
4. **Full day leave = 8 hours**, no work allowed
5. **Cannot apply overlapping leaves**

### For Administrators
1. Validations run on **both client and server side**
2. **Client-side**: Immediate feedback, better UX
3. **Server-side**: Data integrity, security
4. Error messages are **clear and specific**
5. All validations **prevent data insertion** if failed

---

## 🔍 Troubleshooting

### "Timesheet cannot be submitted. Leave already applied for this date."
**Cause**: You have leave on this date
**Solution**: 
- Check your leave entries in "View Entries"
- Choose a different date
- Or cancel the leave first

### "Total hours exceed allowed limit. You have X hours already logged (including leave). Remaining: Y hours."
**Cause**: Your total hours (existing + new) exceed 8 hours
**Solution**:
- Check existing hours for this date
- Reduce new entry hours to fit within remaining hours
- Maximum allowed: Y hours (shown in error message)

### "Leave already applied for overlapping dates."
**Cause**: You're trying to apply leave for dates that already have leave
**Solution**:
- Check your existing leave entries
- Choose non-overlapping dates
- Or modify/cancel existing leave first

---

## 📞 Quick Help

### How to check existing hours for a date?
1. Click "View Entries" button
2. Use search to find the date
3. Check "Hours/Days" column
4. Add up all hours for that date

### How to check existing leave?
1. Click "View Entries" button
2. Select "Leave Only" from filter dropdown
3. Check date ranges
4. Verify no overlap with your planned dates

### How to fix hour limit error?
1. Note the "Remaining" hours from error message
2. Reduce your work entry hours to match remaining
3. Or split work across multiple days
4. Or adjust/cancel existing entries

---

**Last Updated**: February 2025
**Version**: 1.0
**Status**: Active
