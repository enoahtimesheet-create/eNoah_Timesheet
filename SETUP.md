# eNoah Timesheet Application - Setup Guide

## 📋 Overview

This is a comprehensive timesheet management system with:
- ✅ Email OTP Authentication
- ✅ Google Sheets Integration
- ✅ Advanced Form Validations
- ✅ Modern UI/UX
- ✅ Real-time Data Sync
- ✅ Mobile Responsive Design

---

## 🚀 Quick Start

### Prerequisites
- Google Account
- GitHub Account (for hosting)
- Basic understanding of Google Sheets and Google Apps Script

---

## 📦 Step 1: Google Sheets Setup

### 1.1 Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"eNoah Timesheet Database"**
4. The script will automatically create these sheets:
   - `Timesheet Entries` - Main data storage
   - `OTP Tokens` - Temporary OTP storage

### 1.2 Note the Spreadsheet ID

From the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

Copy the `SPREADSHEET_ID` - you'll need this later.

---

## 🔧 Step 2: Google Apps Script Setup

### 2.1 Open Script Editor

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any default code in `Code.gs`
3. Copy the entire content from `Code.gs` file in this project
4. Paste it into the Apps Script editor
5. Save the project (Ctrl+S or Cmd+S)

### 2.2 Deploy as Web App

1. Click **Deploy → New deployment**
2. Click **Select type → Web app**
3. Fill in the details:
   - **Description**: eNoah Timesheet Backend
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **IMPORTANT**: Copy the **Web app URL** - this is your backend endpoint
   - It looks like: `https://script.google.com/macros/s/ABC123.../exec`

### 2.3 Authorize the Script

1. When deploying, you'll see an authorization screen
2. Click **Review permissions**
3. Choose your Google account
4. Click **Advanced → Go to [project name] (unsafe)**
5. Click **Allow**

This grants the script permission to:
- Send emails on your behalf
- Read/write to Google Sheets

### 2.4 Set Up Automatic OTP Cleanup (Optional)

1. In Apps Script editor, click **Triggers** (clock icon)
2. Click **+ Add Trigger**
3. Configure:
   - Choose function: `cleanupExpiredOTPs`
   - Event source: Time-driven
   - Type: Hour timer
   - Hour interval: Every hour
4. Save

---

## 🌐 Step 3: GitHub Pages Deployment

### 3.1 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **New Repository**
3. Name it: `timesheet-app`
4. Set to **Public**
5. Click **Create repository**

### 3.2 Upload Files

Upload these files to your repository:
```
timesheet-app/
├── index.html
├── styles.css
├── script.js
├── config.js
└── README.md
```

### 3.3 Configure Application

1. Open `config.js` in the GitHub editor
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with the Web App URL you copied earlier
3. Example:
```javascript
GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/ABC123xyz.../exec',
```
4. Commit the changes

### 3.4 Enable GitHub Pages

1. Go to repository **Settings**
2. Click **Pages** (left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your app will be live at: `https://[your-username].github.io/timesheet-app/`

---

## ⚙️ Step 4: Configuration & Customization

### 4.1 Email Domain Configuration

In `config.js`, customize valid email domains:

```javascript
VALID_EMAIL_DOMAINS: [
    '@enoahisolution.com',
    '@enoahisolution.co.in',
    '@enoahisolution.com.au',
    // Add more domains as needed
]
```

### 4.2 Validation Rules

Adjust validation rules in `config.js`:

```javascript
VALIDATION: {
    MIN_HOURS: 0.5,           // Minimum billable hours
    MAX_HOURS: 24,            // Maximum hours per entry
    MIN_REMARKS_LENGTH: 10,   // Minimum characters in remarks
    MAX_REMARKS_LENGTH: 500,  // Maximum characters in remarks
    MAX_DATE_RANGE_DAYS: 365, // Max days between from/to dates
    FUTURE_DATE_ALLOWED: false // Allow future date entries
}
```

### 4.3 Project Names

Add your project names in `config.js`:

```javascript
PROJECTS: [
    'Project 1',
    'Project 2',
    'Project 3',
    'UW Platform',
    'Client Name - Project X',
    'Internal Training',
    'Other'
]
```

Also update the dropdown in `index.html`:

```html
<select id="projectName" name="projectName" required>
    <option value="">Select Project</option>
    <option value="Project 1">Project 1</option>
    <!-- Add your projects here -->
</select>
```

### 4.4 Feature Flags

Enable/disable features in `config.js`:

```javascript
FEATURES: {
    ENABLE_OTP: true,              // Email OTP authentication
    ENABLE_DUPLICATE_CHECK: true,  // Warn on duplicate entries
    ENABLE_WEEKEND_WARNING: true,  // Warn when entering weekend data
    ENABLE_HOLIDAY_CHECK: false    // Check against holiday calendar
}
```

---

## 🧪 Step 5: Testing

### 5.1 Test OTP Flow

1. Open your deployed app URL
2. Enter a valid eNoah email address
3. Check your email for the OTP code
4. Enter the OTP and verify login

**Development Testing** (without email):
- Set `ENABLE_OTP: false` in `config.js`
- OTP will be shown in browser console
- Or use default OTP: `123456`

### 5.2 Test Form Submission

1. Login with OTP
2. Fill in the timesheet form
3. Submit the entry
4. Check Google Sheet for the new row
5. Click "View Entries" to see your data

### 5.3 Test Validations

Try these scenarios to verify validations work:
- ❌ Enter hours > 24
- ❌ Enter hours < 0.5
- ❌ Use invalid email domain
- ❌ Enter remarks < 10 characters
- ❌ Set "To Date" before "From Date"
- ❌ Enter future dates (if disabled)
- ⚠️ Enter weekend dates (should show warning)

---

## 🔒 Security Best Practices

### 1. CORS Configuration

The Google Apps Script is deployed with `Anyone` access for simplicity. For production:

1. Consider using API keys or OAuth
2. Implement rate limiting in Apps Script
3. Add IP whitelisting if needed

### 2. OTP Security

- OTPs expire after 10 minutes (configurable)
- Used OTPs are immediately deleted
- Expired OTPs are cleaned up hourly

### 3. Data Privacy

- Each user can only see their own entries
- Email addresses are validated before OTP sending
- No sensitive data is logged

---

## 📊 Data Structure

### Timesheet Entries Sheet Columns:

| Column | Description | Required | Type |
|--------|-------------|----------|------|
| Timestamp | Auto-generated submission time | Yes | DateTime |
| Email Address | User's email | Yes | Email |
| Enter your eNoah email ID | Duplicate email field | Yes | Email |
| From Date | Start date of work/leave | Yes | Date |
| To Date | End date of work/leave | Yes | Date |
| Project Name | Project identifier | Conditional | Text |
| Task | Task description | Conditional | Text |
| Task Type | Billable/Non-Billable | Conditional | Select |
| Hours Spent | Hours worked | Conditional | Number |
| Remarks | Work description | Conditional | Text |
| Attendance | Working/WFH | Yes | Select |
| Leave / Holidays Types | Leave category | Conditional | Select |
| Session | Full/Half day | Conditional | Select |

---

## 🐛 Troubleshooting

### Issue: OTP Email Not Received

**Solutions:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Apps Script execution logs:
   - Apps Script Editor → Executions
4. Verify Gmail sending limits (500 emails/day for free accounts)

### Issue: CORS Error in Browser

**Solutions:**
1. Ensure Web App is deployed as "Anyone" can access
2. Redeploy the Web App after making changes
3. Clear browser cache
4. Try incognito/private mode

### Issue: Data Not Saving to Sheet

**Solutions:**
1. Check Apps Script execution logs for errors
2. Verify sheet permissions
3. Ensure Web App URL is correctly configured in `config.js`
4. Check browser console for errors

### Issue: Form Validation Not Working

**Solutions:**
1. Clear browser cache
2. Check browser console for JavaScript errors
3. Ensure all required files are uploaded to GitHub
4. Verify `config.js` is properly loaded

---

## 🔄 Updates & Maintenance

### Updating the Application

1. Make changes to files locally
2. Commit and push to GitHub
3. GitHub Pages will auto-deploy (may take 1-2 minutes)
4. For Apps Script changes:
   - Update code in Apps Script editor
   - Create new deployment version
   - Update Web App URL if deployment URL changes

### Database Backup

**Manual Backup:**
1. Open Google Sheet
2. File → Download → Excel (.xlsx)

**Automated Backup** (optional):
- Set up Google Takeout for automatic backups
- Use Apps Script to export data periodically
- Use Google Drive backup tools

---

## 📱 Mobile Support

The application is fully responsive and works on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Tablets

---

## 🎨 Customization

### Branding

1. **Logo**: Replace SVG in `index.html` (search for `.logo-circle svg`)
2. **Colors**: Modify CSS variables in `styles.css`:
```css
:root {
    --color-primary: #6366f1;  /* Main brand color */
    --color-secondary: #06b6d4; /* Accent color */
    /* ... */
}
```

3. **Fonts**: Change in `styles.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');
```

### Email Template

Customize OTP email in `Code.gs`:
```javascript
getEmailTemplate: function(otp, expiryMinutes) {
    return `<!-- Your custom HTML template -->`;
}
```

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Check Apps Script execution logs
4. Review validation messages in the app

---

## 📄 License

This project is created for eNoah iSolution internal use.

---

## ✨ Features Summary

### Authentication
- ✅ Email OTP-based login
- ✅ OTP expiration (10 minutes)
- ✅ Resend OTP functionality
- ✅ Auto-logout

### Data Entry
- ✅ Work entry mode
- ✅ Leave/Holiday mode
- ✅ Date range selection
- ✅ Project selection
- ✅ Task type (Billable/Non-Billable)
- ✅ Hours tracking (0.5 hour increments)
- ✅ Attendance status

### Validations
- ✅ Email domain validation
- ✅ Date range validation
- ✅ Future date prevention
- ✅ Weekend warning
- ✅ Hours range validation (0.5 - 24)
- ✅ Minimum remarks length
- ✅ Duplicate entry detection
- ✅ Required field validation
- ✅ Real-time error messages

### UI/UX
- ✅ Modern dark theme
- ✅ Smooth animations
- ✅ Loading indicators
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Responsive design
- ✅ Keyboard navigation
- ✅ OTP paste support

### Data Management
- ✅ View all entries
- ✅ Filter by date range
- ✅ Sort by timestamp
- ✅ Export-ready format
- ✅ Real-time sync with Google Sheets

---

## 🚀 Advanced Features (Optional Implementation)

### 1. Manager Approval Workflow
- Add "Status" column (Pending/Approved/Rejected)
- Create manager dashboard
- Email notifications for approvals

### 2. Reports & Analytics
- Weekly/Monthly reports
- Project-wise hours breakdown
- Billable vs Non-Billable ratio
- Charts and visualizations

### 3. Integration
- Slack notifications
- Export to PDF
- Calendar integration
- JIRA sync

---

**Created with ❤️ for eNoah iSolution**
