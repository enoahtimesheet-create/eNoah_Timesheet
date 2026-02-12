// Configuration file for Google Apps Script Integration
// Replace these values with your actual Google Apps Script Web App URL and API Key

const CONFIG = {
    // Google Apps Script Web App URL
    // To get this URL:
    // 1. Create a Google Apps Script project (instructions in SETUP.md)
    // 2. Deploy as Web App
    // 3. Copy the deployment URL here
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxDxlJNAmZU-MA1VFMm3ehWz9iZqS1-etGXko4pjOkkTE3FfxXngUfODKSGiVcNzHg9aA/exec',
    
    // Email Configuration for OTP
    // The Google Apps Script will handle sending emails
    OTP_EXPIRY_MINUTES: 10,
    OTP_RESEND_SECONDS: 60,
    
    // Valid email domains for eNoah
    VALID_EMAIL_DOMAINS: [
        '@enoahisolution.com',
        '@enoahisolution.co.in',
        '@enoahisolution.com.au'
    ],
    
    // Form Validation Rules
    VALIDATION: {
        MIN_HOURS: 0.5,
        MAX_HOURS: 24,
        MIN_REMARKS_LENGTH: 10,
        MAX_REMARKS_LENGTH: 500,
        MAX_DATE_RANGE_DAYS: 365, // Maximum days between from and to date
        FUTURE_DATE_ALLOWED: false // Can users enter future dates
    },
    
    // Project Names (can be extended)
    PROJECTS: [
        'Project 1',
        'Project 2',
        'Project 3',
        'UW Platform',
        'Other'
    ],
    
    // Feature Flags
    FEATURES: {
        ENABLE_OTP: false, // Set to false for testing without OTP
        ENABLE_DUPLICATE_CHECK: true, // Check for duplicate entries
        ENABLE_WEEKEND_WARNING: true, // Warn when entering data for weekends
        ENABLE_HOLIDAY_CHECK: false // Check against holiday calendar (requires setup)
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
