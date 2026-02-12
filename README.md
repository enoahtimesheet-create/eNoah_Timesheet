# 📊 eNoah Timesheet Application

<div align="center">

![Timesheet](https://img.shields.io/badge/Timesheet-Management-blue)
![Google Sheets](https://img.shields.io/badge/Google-Sheets-green)
![OTP](https://img.shields.io/badge/Auth-OTP-orange)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

**A modern, secure, and feature-rich timesheet management system with email OTP authentication and Google Sheets integration.**

[Live Demo](#) | [Setup Guide](SETUP.md) | [Report Bug](#) | [Request Feature](#)

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- **Email OTP Authentication** - Secure login with one-time passwords
- **Domain Validation** - Restricted to authorized eNoah email domains
- **Session Management** - Auto-logout and secure session handling
- **OTP Expiration** - Time-limited codes for enhanced security

### 📝 Data Entry
- **Dual Entry Modes** - Work entries and Leave/Holiday entries
- **Flexible Date Ranges** - Single day or multi-day entries
- **Project Tracking** - Organized project and task management
- **Hours Logging** - Precise time tracking with 0.5-hour increments
- **Task Classification** - Billable vs Non-Billable categorization

### ✅ Advanced Validations
- **Email Domain Verification** - Only accept authorized email addresses
- **Date Range Validation** - Prevent invalid date ranges
- **Future Date Prevention** - Block entries for future dates
- **Weekend Warnings** - Alert users about weekend entries
- **Hours Validation** - Enforce minimum (0.5) and maximum (24) hours
- **Duplicate Detection** - Warn about potential duplicate entries
- **Remarks Length Check** - Ensure adequate work descriptions
- **Real-time Error Display** - Instant feedback on form errors

### 💾 Data Management
- **Google Sheets Integration** - Automatic data sync to cloud
- **View Historical Entries** - Access all your previous submissions
- **Date Range Filtering** - Find entries within specific periods
- **Auto-sorting** - Newest entries appear first
- **Export-ready Format** - Data structured for easy export

### 🎨 User Interface
- **Modern Dark Theme** - Eye-friendly design with gradient accents
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Smooth Animations** - Polished transitions and micro-interactions
- **Loading Indicators** - Clear feedback during operations
- **Toast Notifications** - Non-intrusive success/error messages
- **Modal Dialogs** - Clean data visualization
- **Keyboard Shortcuts** - Enhanced productivity

---

## 🚀 Quick Start

### For Users

1. **Access the Application**
   - Visit: `https://[your-username].github.io/timesheet-app/`

2. **Login**
   - Enter your eNoah email address
   - Check email for 6-digit OTP
   - Enter OTP to login

3. **Submit Timesheet**
   - Select entry type (Work or Leave)
   - Fill in required fields
   - Click "Submit Entry"

4. **View Entries**
   - Click "View Entries" button
   - Filter by date range if needed
   - Review your submission history

### For Administrators

See [SETUP.md](SETUP.md) for complete deployment instructions.

---

## 📸 Screenshots

### Login Screen
Clean and modern authentication with email OTP

### Timesheet Form
Intuitive form with real-time validation

### View Entries
Comprehensive data table with filtering

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Styling** | CSS Variables, Flexbox, Grid |
| **Backend** | Google Apps Script |
| **Database** | Google Sheets |
| **Email** | Gmail SMTP (via Apps Script) |
| **Hosting** | GitHub Pages |
| **Authentication** | OTP (Email-based) |

---

## 📋 Validation Rules

### Email Validation
- ✅ Must be a valid email format
- ✅ Must end with authorized domain (@enoahisolution.com, .co.in, or .com.au)

### Date Validation
- ✅ From Date is required
- ✅ To Date is required
- ✅ To Date must be >= From Date
- ✅ Future dates not allowed (configurable)
- ✅ Maximum range: 365 days
- ⚠️ Weekend warning (if enabled)

### Work Entry Validation
- ✅ Project Name is required
- ✅ Task must be 2-100 characters
- ✅ Task Type is required (Billable/Non-Billable)
- ✅ Hours: 0.5 to 24 in 0.5 increments
- ✅ Remarks: 10-500 characters
- ✅ Attendance status is required

### Leave Entry Validation
- ✅ Leave Type is required
- ✅ Session is required (Full Day/Half Day)

---

## ⚙️ Configuration Options

### In `config.js`:

```javascript
// Email Configuration
OTP_EXPIRY_MINUTES: 10,        // OTP validity period
OTP_RESEND_SECONDS: 60,        // Cooldown before resend

// Validation Rules
MIN_HOURS: 0.5,                // Minimum billable hours
MAX_HOURS: 24,                 // Maximum hours per entry
MIN_REMARKS_LENGTH: 10,        // Minimum remarks length
MAX_DATE_RANGE_DAYS: 365,      // Maximum date range

// Feature Flags
ENABLE_OTP: true,              // Email OTP authentication
ENABLE_DUPLICATE_CHECK: true,  // Duplicate entry detection
ENABLE_WEEKEND_WARNING: true,  // Weekend entry warnings
```

---

## 📊 Data Structure

### Columns in Google Sheets

```
Timestamp | Email Address | Enter your eNoah email ID | From Date | 
To Date | Project Name | Task | Task Type | Hours Spent | Remarks | 
Attendance | Leave / Holidays Types | Session
```

### Entry Types

**Work Entry:**
- Project Name
- Task Description
- Task Type (Billable/Non-Billable)
- Hours Spent
- Remarks
- Attendance (Working/Work From Home)

**Leave Entry:**
- Leave Type (Sick/Casual/National Holiday/etc.)
- Session (Full Day/Half Day)

---

## 🔒 Security Features

1. **OTP-Based Authentication**
   - 6-digit numeric codes
   - 10-minute expiration
   - One-time use only
   - Automatic cleanup of expired codes

2. **Email Domain Restriction**
   - Only authorized eNoah domains allowed
   - Server-side validation in Google Apps Script
   - Client-side validation for immediate feedback

3. **Data Privacy**
   - Users see only their own entries
   - Email-based access control
   - Secure HTTPS connection (GitHub Pages)

4. **Input Validation**
   - Client-side validation for UX
   - Server-side validation for security
   - SQL injection prevention
   - XSS protection

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Fully Supported |
| Firefox | Latest | ✅ Fully Supported |
| Safari | Latest | ✅ Fully Supported |
| Edge | Latest | ✅ Fully Supported |
| Mobile Chrome | Latest | ✅ Fully Supported |
| Mobile Safari | Latest | ✅ Fully Supported |

---

## 🐛 Known Issues

None currently. Report issues via GitHub Issues.

---

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Email OTP Authentication
- [x] Basic timesheet entry
- [x] Google Sheets integration
- [x] Advanced validations
- [x] View entries feature

### Phase 2 (Planned)
- [ ] Manager approval workflow
- [ ] Email notifications
- [ ] Bulk upload feature
- [ ] Export to PDF/Excel
- [ ] Weekly/Monthly reports

### Phase 3 (Future)
- [ ] Analytics dashboard
- [ ] Project-wise reporting
- [ ] Calendar integration
- [ ] Mobile app (PWA)
- [ ] Slack integration

---

## 💡 Best Practices

### For Users
1. Submit timesheets daily for accuracy
2. Provide detailed remarks for better tracking
3. Classify tasks correctly (Billable/Non-Billable)
4. Double-check dates before submission
5. Use "View Entries" to verify submissions

### For Administrators
1. Regularly backup Google Sheets data
2. Monitor Apps Script execution quotas
3. Review and clean up old OTP entries
4. Update project list as needed
5. Communicate policy changes to users

---

## 🤝 Contributing

This is an internal eNoah iSolution project. For suggestions:

1. Document the feature request
2. Discuss with team lead
3. Create a detailed proposal
4. Submit for review

---

## 📄 License

Copyright © 2024 eNoah iSolution. All rights reserved.

Internal use only. Not for public distribution.

---

## 👥 Support

### For Technical Issues
- Check [SETUP.md](SETUP.md) documentation
- Review browser console for errors
- Contact IT support team

### For Usage Questions
- Refer to in-app help text
- Review validation messages
- Consult with team lead

---

## 📚 Documentation

- [Setup Guide](SETUP.md) - Complete deployment instructions
- [User Guide](#) - How to use the application
- [Admin Guide](#) - Configuration and maintenance
- [API Documentation](#) - Google Apps Script API reference

---

## 🙏 Acknowledgments

- Built for eNoah iSolution team
- Designed with modern web standards
- Powered by Google Workspace

---

## 📞 Contact

For questions or support:
- **Email**: it-support@enoahisolution.com
- **Internal**: Contact IT department

---

<div align="center">

**Built with ❤️ for eNoah iSolution**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com)
[![Google](https://img.shields.io/badge/Google-Sheets-green)](https://sheets.google.com)

</div>
