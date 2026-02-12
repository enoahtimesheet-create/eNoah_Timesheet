// Timesheet Application - Main Script
// Author: eNoah iSolution
// Version: 1.0.0

// ==================== STATE MANAGEMENT ====================
const AppState = {
    currentScreen: 'login',
    userEmail: '',
    otpToken: '',
    otpExpiry: null,
    resendTimer: null,
    entries: [],
    filteredEntries: [],
    timesheetRows: [],
    currentPage: 1,
    itemsPerPage: 10,
    entryTypeFilter: 'all',
    maxAllowedHours: 8,
    canSubmit: true
};

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
    // Show toast notification with auto-hide and fade out
    showToast(message, type = 'success', duration = 7000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        // Force reflow to restart animation
        void toast.offsetWidth;
        
        // Show toast
        toast.classList.add('show');
        
        // Start fade out before hiding
        setTimeout(() => {
            toast.classList.add('hide');
            toast.classList.remove('show');
            
            // Fully remove after fade out animation
            setTimeout(() => {
                toast.className = 'toast';
            }, 400);
        }, duration - 400);
    },
    
    // Show/hide loading overlay
    setLoading(isLoading) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('active', isLoading);
    },
    
    // Switch screens
    switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}Screen`).classList.add('active');
        AppState.currentScreen = screenName;
    },
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },
    
    // Get current timestamp
    getTimestamp() {
        return new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        });
    },
    
    // Validate email domain
    isValidEmailDomain(email) {
        return CONFIG.VALID_EMAIL_DOMAINS.some(domain => 
            email.toLowerCase().endsWith(domain)
        );
    },
    
    // Check if date is weekend
    isWeekend(dateString) {
        const date = new Date(dateString);
        const day = date.getDay();
        return day === 0 || day === 6;
    },
    
    // Check if date is in future
    isFutureDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return date > today;
    },
    
    // Calculate days between dates
    getDaysBetween(fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diffTime = Math.abs(to - from);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Generate random OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};

// ==================== VALIDATION ====================
const Validator = {
    // Clear all error messages
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    },
    
    // Show error for specific field
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}Error`);
        
        if (field) {
            field.classList.add('error');
            field.focus();
        }
        if (errorEl) {
            errorEl.textContent = message;
        }
        
        return false;
    },
    
    // Validate email
    validateEmail(email) {
        this.clearErrors();
        
        if (!email) {
            return this.showError('loginEmail', 'Email address is required');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return this.showError('loginEmail', 'Please enter a valid email address');
        }
        
        if (!Utils.isValidEmailDomain(email)) {
            return this.showError('loginEmail', 
                'Please use a valid eNoah email address (@enoahisolution.com, .co.in, or .com.au)');
        }
        
        return true;
    },
    
    // Validate OTP
    validateOTP(otp) {
        this.clearErrors();
        
        if (!otp || otp.length !== 6) {
            return this.showError('otpError', 'Please enter the complete 6-digit OTP');
        }
        
        if (!/^\d{6}$/.test(otp)) {
            return this.showError('otpError', 'OTP must contain only numbers');
        }
        
        return true;
    },
    
    // Validate date range
    validateDateRange(fromDate, toDate) {
        if (!fromDate) {
            return this.showError('fromDate', 'From date is required');
        }
        
        if (!toDate) {
            return this.showError('toDate', 'To date is required');
        }
        
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        if (to < from) {
            return this.showError('toDate', 'To date cannot be earlier than from date');
        }
        
        if (!CONFIG.VALIDATION.FUTURE_DATE_ALLOWED) {
            if (Utils.isFutureDate(fromDate)) {
                return this.showError('fromDate', 'Future dates are not allowed');
            }
            if (Utils.isFutureDate(toDate)) {
                return this.showError('toDate', 'Future dates are not allowed');
            }
        }
        
        const daysDiff = Utils.getDaysBetween(fromDate, toDate);
        if (daysDiff > CONFIG.VALIDATION.MAX_DATE_RANGE_DAYS) {
            return this.showError('toDate', 
                `Date range cannot exceed ${CONFIG.VALIDATION.MAX_DATE_RANGE_DAYS} days`);
        }
        
        // Warning for weekend dates (if enabled)
        if (CONFIG.FEATURES.ENABLE_WEEKEND_WARNING) {
            if (Utils.isWeekend(fromDate) || Utils.isWeekend(toDate)) {
                Utils.showToast('Note: You are entering data for a weekend', 'warning');
            }
        }
        
        return true;
    },
    
    // Validate work entry fields
    validateWorkEntry(formData) {
        // Project Name
        if (!formData.projectName) {
            return this.showError('projectName', 'Please select a project');
        }
        
        // Task
        if (!formData.task || formData.task.trim().length < 2) {
            return this.showError('task', 'Task name must be at least 2 characters');
        }
        
        if (formData.task.trim().length > 100) {
            return this.showError('task', 'Task name cannot exceed 100 characters');
        }
        
        // Task Type
        if (!formData.taskType) {
            return this.showError('taskType', 'Please select a task type');
        }
        
        // Hours Spent
        if (!formData.hoursSpent) {
            return this.showError('hoursSpent', 'Hours spent is required');
        }
        
        const hours = parseFloat(formData.hoursSpent);
        if (isNaN(hours)) {
            return this.showError('hoursSpent', 'Please enter a valid number');
        }
        
        if (hours < CONFIG.VALIDATION.MIN_HOURS) {
            return this.showError('hoursSpent', 
                `Minimum hours allowed: ${CONFIG.VALIDATION.MIN_HOURS}`);
        }
        
        if (hours > CONFIG.VALIDATION.MAX_HOURS) {
            return this.showError('hoursSpent', 
                `Maximum hours allowed: ${CONFIG.VALIDATION.MAX_HOURS}`);
        }
        
        // Validate hours are in 0.5 increments
        if (hours % 0.5 !== 0) {
            return this.showError('hoursSpent', 'Hours must be in 0.5 increments (e.g., 1.5, 2.0, 2.5)');
        }
        
        // Remarks
        if (!formData.remarks || formData.remarks.trim().length < CONFIG.VALIDATION.MIN_REMARKS_LENGTH) {
            return this.showError('remarks', 
                `Remarks must be at least ${CONFIG.VALIDATION.MIN_REMARKS_LENGTH} characters`);
        }
        
        if (formData.remarks.trim().length > CONFIG.VALIDATION.MAX_REMARKS_LENGTH) {
            return this.showError('remarks', 
                `Remarks cannot exceed ${CONFIG.VALIDATION.MAX_REMARKS_LENGTH} characters`);
        }
        
        return true;
    },
    
    // Validate leave entry fields
    validateLeaveEntry(formData) {
        // Leave Type
        if (!formData.leaveType) {
            return this.showError('leaveType', 'Please select a leave type');
        }
        
        // Session
        if (!formData.session) {
            return this.showError('session', 'Please select a session');
        }
        
        // From Date
        if (!formData.fromDate) {
            return this.showError('leaveFromDate', 'From date is required');
        }
        
        // To Date
        if (!formData.toDate) {
            return this.showError('leaveToDate', 'To date is required');
        }
        
        const from = new Date(formData.fromDate);
        const to = new Date(formData.toDate);
        
        if (to < from) {
            return this.showError('leaveToDate', 'To date cannot be earlier than from date');
        }
        
        // Check future dates only if NOT Casual Leave
        if (formData.leaveType !== 'Casual Leave') {
            if (Utils.isFutureDate(formData.fromDate)) {
                return this.showError('leaveFromDate', 'Future dates are not allowed for this leave type');
            }
            if (Utils.isFutureDate(formData.toDate)) {
                return this.showError('leaveToDate', 'Future dates are not allowed for this leave type');
            }
        }
        
        // Description
        if (!formData.description || formData.description.trim().length < 5) {
            return this.showError('leaveDescription', 'Description must be at least 5 characters');
        }
        
        return true;
    },
    
    // Check for duplicate entries
    async checkDuplicateEntry(formData) {
        if (!CONFIG.FEATURES.ENABLE_DUPLICATE_CHECK) {
            return true;
        }
        
        // This would check against existing entries in Google Sheets
        // For now, we'll implement a basic check against cached entries
        const duplicate = AppState.entries.find(entry => 
            entry['Email Address'] === AppState.userEmail &&
            entry['From Date'] === formData.fromDate &&
            entry['To Date'] === formData.toDate &&
            entry['Project Name'] === formData.projectName &&
            entry['Task'] === formData.task
        );
        
        if (duplicate) {
            const confirmSubmit = confirm(
                'A similar entry already exists for this date and project. Do you want to submit anyway?'
            );
            return confirmSubmit;
        }
        
        return true;
    }
};

// ==================== API COMMUNICATION ====================
const API = {
    // Send OTP to email
    async sendOTP(email) {
        try {
            if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.includes('YOUR_GOOGLE')) {
                throw new Error('Google Apps Script URL not configured. Please update config.js');
            }
            
            console.log('Sending OTP to:', email);
            
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    action: 'sendOTP',
                    email: email
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to send OTP email');
            }
            
            const result = await response.json();
            console.log('Response result:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to send OTP');
            }
            
            // Store OTP for testing (from backend response)
            if (result.otp) {
                console.log('✅ OTP for testing:', result.otp);
            }
            
            console.log('OTP sent successfully to', email);
            return { success: true };
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw new Error(error.message || 'Failed to send OTP. Please try again.');
        }
    },
    
    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    action: 'verifyOTP',
                    email: email,
                    otp: otp
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to verify OTP');
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Invalid OTP');
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    },
    
    // Submit timesheet entry to Google Sheets
    async submitEntry(formData) {
        try {
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    action: 'submitEntry',
                    data: formData
                })
            });
            
            // Add to local cache
            AppState.entries.unshift(formData);
            
            return { success: true };
        } catch (error) {
            console.error('Error submitting entry:', error);
            throw new Error('Failed to submit entry. Please try again.');
        }
    },
    
    // Fetch user entries from Google Sheets
    async fetchEntries(email) {
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getEntries&email=${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch entries');
            }
            
            const data = await response.json();
            AppState.entries = data.entries || [];
            AppState.filteredEntries = AppState.entries;
            
            return { success: true, entries: AppState.entries };
        } catch (error) {
            console.error('Error fetching entries:', error);
            return { success: true, entries: [] };
        }
    },
    
    // Check for leave/work conflicts and return detailed info
    checkDateLeaveStatus(date) {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        let leaveHours = 0;
        let workHours = 0;
        
        for (const entry of AppState.entries) {
            if (entry['Entry Type'] === 'Leave') {
                const fromDate = new Date(entry['From Date']);
                const toDate = new Date(entry['To Date']);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(0, 0, 0, 0);
                
                if (checkDate >= fromDate && checkDate <= toDate) {
                    leaveHours = entry['Session'].includes('Full Day') ? 8 : 4;
                }
            } else if (entry['Entry Type'] === 'Work') {
                const entryDate = new Date(entry['Date']);
                entryDate.setHours(0, 0, 0, 0);
                
                if (entryDate.getTime() === checkDate.getTime()) {
                    workHours += parseFloat(entry['Hours Spent']) || 0;
                }
            }
        }
        
        return {
            leaveHours: leaveHours,
            workHours: workHours,
            totalHours: leaveHours + workHours,
            remainingHours: 8 - leaveHours - workHours,
            hasFullLeave: leaveHours === 8,
            hasPartialLeave: leaveHours > 0 && leaveHours < 8
        };
    },
    
    // Check total hours for a date
    checkHoursLimit(date, newHours) {
        const status = this.checkDateLeaveStatus(date);
        const totalHours = status.totalHours + newHours;
        
        if (totalHours > 8) {
            return {
                exceedsLimit: true,
                existingHours: status.totalHours,
                remaining: status.remainingHours,
                message: `Total hours exceed allowed limit. You have ${status.totalHours} hours already logged (including leave). Remaining: ${status.remainingHours} hours.`
            };
        }
        
        return { exceedsLimit: false, existingHours: status.totalHours, remaining: status.remainingHours };
    }
};

// ==================== UI HANDLERS ====================
const UI = {
    // Initialize OTP inputs
    initOTPInputs() {
        const inputs = document.querySelectorAll('.otp-digit');
        
        inputs.forEach((input, index) => {
            // Auto-focus next input
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
            
            // Allow only numbers
            input.addEventListener('keypress', (e) => {
                if (!/\d/.test(e.key)) {
                    e.preventDefault();
                }
            });
            
            // Handle paste
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').slice(0, 6);
                if (/^\d+$/.test(pastedData)) {
                    pastedData.split('').forEach((char, i) => {
                        if (inputs[i]) {
                            inputs[i].value = char;
                        }
                    });
                    if (pastedData.length === 6) {
                        inputs[5].focus();
                    }
                }
            });
        });
    },
    
    // Get OTP value from inputs
    getOTPValue() {
        const inputs = document.querySelectorAll('.otp-digit');
        return Array.from(inputs).map(input => input.value).join('');
    },
    
    // Clear OTP inputs
    clearOTPInputs() {
        document.querySelectorAll('.otp-digit').forEach(input => {
            input.value = '';
        });
        document.querySelector('.otp-digit').focus();
    },
    
    // Start resend timer
    startResendTimer() {
        let seconds = CONFIG.OTP_RESEND_SECONDS;
        const timerEl = document.getElementById('resendTimer');
        const resendBtn = document.getElementById('resendOtp');
        
        resendBtn.disabled = true;
        
        AppState.resendTimer = setInterval(() => {
            seconds--;
            timerEl.textContent = `(${seconds}s)`;
            
            if (seconds <= 0) {
                clearInterval(AppState.resendTimer);
                resendBtn.disabled = false;
                timerEl.textContent = '';
            }
        }, 1000);
    },
    
    // Toggle entry type (work/leave)
    toggleEntryType(type) {
        const workFields = document.getElementById('workFields');
        const leaveFields = document.getElementById('leaveFields');
        const dateField = document.querySelector('.entry-type-date-row .form-group');
        const entryDateInput = document.getElementById('entryDate');
        
        if (type === 'work') {
            workFields.style.display = 'block';
            leaveFields.style.display = 'none';
            if (dateField) dateField.classList.remove('date-field-hide');
            if (entryDateInput) entryDateInput.setAttribute('required', 'required');
            leaveFields.querySelectorAll('select, input, textarea').forEach(el => el.removeAttribute('required'));
        } else {
            workFields.style.display = 'none';
            leaveFields.style.display = 'block';
            if (dateField) dateField.classList.add('date-field-hide');
            if (entryDateInput) entryDateInput.removeAttribute('required');
            leaveFields.querySelectorAll('select, input, textarea').forEach(el => el.setAttribute('required', 'required'));
        }
        
        Validator.clearErrors();
    },
    
    addTimesheetRow() {
        AppState.timesheetRows.push({
            project: '', task: '', billingType: '', description: '', hours: 0
        });
        this.renderTimesheetRows();
    },
    
    renderTimesheetRows() {
        const selectedDate = document.getElementById('entryDate').value;
        if (!selectedDate) {
            document.getElementById('selectedDay').textContent = '';
        } else {
            const date = new Date(selectedDate + 'T00:00:00');
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
            document.getElementById('selectedDay').textContent = dayName + ', ' + date.toLocaleDateString();
        }
        
        const tbody = document.getElementById('timesheetBody');
        tbody.innerHTML = AppState.timesheetRows.map((row, idx) => `
            <tr>
                <td><select onchange="updateTimesheetRow(${idx}, 'project', this.value)">
                    <option value="">Select</option>
                    <option value="Project 1" ${row.project === 'Project 1' ? 'selected' : ''}>Project 1</option>
                    <option value="Project 2" ${row.project === 'Project 2' ? 'selected' : ''}>Project 2</option>
                    <option value="UW Platform" ${row.project === 'UW Platform' ? 'selected' : ''}>UW Platform</option>
                </select></td>
                <td><input type="text" value="${row.task}" onchange="updateTimesheetRow(${idx}, 'task', this.value)" placeholder="Enter task"></td>
                <td><select onchange="updateTimesheetRow(${idx}, 'billingType', this.value)">
                    <option value="">Select</option>
                    <option value="Billable" ${row.billingType === 'Billable' ? 'selected' : ''}>Billable</option>
                    <option value="Non-Billable" ${row.billingType === 'Non-Billable' ? 'selected' : ''}>Non-Billable</option>
                </select></td>
                <td><input type="text" value="${row.description}" onchange="updateTimesheetRow(${idx}, 'description', this.value)" placeholder="Work description"></td>
                <td><input type="number" min="0" max="24" step="0.5" value="${row.hours}" onchange="updateTimesheetHours(${idx}, this.value)"></td>
                <td><button class="delete-btn" onclick="deleteTimesheetRow(${idx})">Delete</button></td>
            </tr>
        `).join('');
        this.updateTotalHours();
    },
    
    updateTotalHours() {
        const total = AppState.timesheetRows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0);
        document.getElementById('totalHours').textContent = total;
        
        const selectedDate = document.getElementById('entryDate').value;
        const submitBtn = document.querySelector('#timesheetForm button[type="submit"]');
        const entryType = document.querySelector('.entry-type-btn.active, .entry-type-btn-small.active')?.dataset.type || 'work';
        
        // Only enforce 8-hour validation for WORK entries
        if (entryType === 'work' && selectedDate) {
            // Get existing hours from server (work + leave)
            const status = API.checkDateLeaveStatus(selectedDate);
            const totalWithExisting = status.totalHours + total;
            
            // MUST be exactly 8 hours for work entries
            if (totalWithExisting !== 8) {
                AppState.canSubmit = false;
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                    submitBtn.style.cursor = 'not-allowed';
                }
            } else {
                AppState.canSubmit = true;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }
            }
        } else {
            // For leave entries, always allow submission
            AppState.canSubmit = true;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        }
    },
    
    // Populate entries table with DataTables
    populateEntriesTable(entries) {
        const container = document.getElementById('entriesTable');
        
        if (!entries || entries.length === 0) {
            container.innerHTML = '<div class="loading">No entries found</div>';
            return;
        }
        
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable.isDataTable('#entriesDataTable')) {
            $('#entriesDataTable').DataTable().destroy();
        }
        
        let html = `
            <table id="entriesDataTable" class="display" style="width:100%">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Project/Leave</th>
                        <th>Task/Session</th>
                        <th>Hours/Days</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        entries.forEach(entry => {
            if (entry['Entry Type'] === 'Work') {
                html += `
                    <tr>
                        <td>${entry['Date'] || '-'}</td>
                        <td><span class="badge badge-billable">Work</span></td>
                        <td>${entry['Project Name'] || '-'}</td>
                        <td>${entry['Task'] || '-'}</td>
                        <td><strong>${entry['Hours Spent'] || 0} hrs</strong></td>
                        <td>${entry['Work Description'] || '-'}</td>
                    </tr>
                `;
            } else if (entry['Entry Type'] === 'Leave') {
                html += `
                    <tr>
                        <td>${entry['From Date'] || '-'} to ${entry['To Date'] || '-'}</td>
                        <td><span class="badge badge-leave">Leave</span></td>
                        <td>${entry['Leave Type'] || '-'}</td>
                        <td>${entry['Session'] || '-'}</td>
                        <td><strong>${entry['Day Count'] || 0} days</strong></td>
                        <td>${entry['Description'] || '-'}</td>
                    </tr>
                `;
            }
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
        
        // Initialize DataTable
        $('#entriesDataTable').DataTable({
            order: [[0, 'desc']],
            pageLength: 10,
            responsive: true,
            language: {
                search: "Search entries:",
                lengthMenu: "Show _MENU_ entries per page",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
    },
    
    // Filter entries by entry type
    filterEntries(entryType) {
        let filtered = AppState.entries;
        
        if (entryType && entryType !== 'all') {
            filtered = filtered.filter(entry => entry['Entry Type'] === entryType);
        }
        
        AppState.filteredEntries = filtered;
        this.populateEntriesTable(filtered);
    },
    
    // Reset form
    resetForm() {
        document.getElementById('timesheetForm').reset();
        AppState.timesheetRows = [];
        this.renderTimesheetRows();
        Validator.clearErrors();
        // Reset to Work button
        document.querySelectorAll('.entry-type-btn, .entry-type-btn-small').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('[data-type="work"]').forEach(b => b.classList.add('active'));
        this.toggleEntryType('work');
    }
};

// ==================== EVENT HANDLERS ====================

// Email form submission
document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    
    if (!Validator.validateEmail(email)) {
        return;
    }
    
    try {
        Utils.setLoading(true);
        const result = await API.sendOTP(email);
        
        AppState.userEmail = email;
        document.getElementById('sentToEmail').textContent = email;
        
        Utils.switchScreen('otp');
        UI.startResendTimer();
        UI.clearOTPInputs();
        
        Utils.showToast('OTP sent successfully! Check your email.');
    } catch (error) {
        Utils.showToast(error.message, 'error');
    } finally {
        Utils.setLoading(false);
    }
});

// OTP form submission
document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const otp = UI.getOTPValue();
    
    if (!Validator.validateOTP(otp)) {
        return;
    }
    
    try {
        Utils.setLoading(true);
        await API.verifyOTP(AppState.userEmail, otp);
        
        document.getElementById('userEmail').textContent = AppState.userEmail;
        Utils.switchScreen('timesheet');
        
        // Don't fetch entries on login - only when user clicks View Entries
        
        Utils.showToast('Login successful! Welcome to Timesheet.');
    } catch (error) {
        Utils.showToast(error.message, 'error');
        Validator.showError('otpError', error.message);
    } finally {
        Utils.setLoading(false);
    }
});

// Resend OTP
document.getElementById('resendOtp').addEventListener('click', async () => {
    try {
        Utils.setLoading(true);
        await API.sendOTP(AppState.userEmail);
        
        UI.clearOTPInputs();
        UI.startResendTimer();
        
        Utils.showToast('New OTP sent successfully!');
    } catch (error) {
        Utils.showToast(error.message, 'error');
    } finally {
        Utils.setLoading(false);
    }
});

// Entry type selection
document.querySelectorAll('.entry-type-btn, .entry-type-btn-small').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all buttons
        document.querySelectorAll('.entry-type-btn, .entry-type-btn-small').forEach(b => b.classList.remove('active'));
        // Add active to clicked button
        btn.classList.add('active');
        // Toggle entry type
        UI.toggleEntryType(btn.dataset.type);
        // Update total hours validation based on entry type
        UI.updateTotalHours();
    });
});

// Timesheet form submission
document.getElementById('timesheetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    Validator.clearErrors();
    
    const entryType = document.querySelector('.entry-type-btn.active, .entry-type-btn-small.active')?.dataset.type || 'work';
    const entryDate = document.getElementById('entryDate').value;
    
    const formData = {
        'Timestamp': Utils.getTimestamp(),
        'Email Address': AppState.userEmail,
        'Enter your eNoah email ID': AppState.userEmail
    };
    
    try {
        Utils.setLoading(true);
        
        // Fetch latest entries for validation
        await API.fetchEntries(AppState.userEmail);
        
        if (entryType === 'work') {
            if (!entryDate) {
                Utils.showToast('Please select a date', 'error', 7000);
                return;
            }
            
            // Check date status
            const status = API.checkDateLeaveStatus(entryDate);
            
            if (status.hasFullLeave) {
                Utils.showToast('Leave already applied for this date. Timesheet submission is not allowed.', 'error', 7000);
                Utils.setLoading(false);
                return;
            }
            
            if (AppState.timesheetRows.length === 0) {
                Utils.showToast('Please add at least one timesheet row', 'error', 7000);
                Utils.setLoading(false);
                return;
            }
            
            const totalHours = AppState.timesheetRows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0);
            const totalWithExisting = status.totalHours + totalHours;
            
            // MUST be exactly 8 hours
            if (totalWithExisting !== 8) {
                if (totalWithExisting > 8) {
                    Utils.showToast(`Total hours exceed 8. You have ${status.totalHours} hours already logged. You can only add ${8 - status.totalHours} more hours.`, 'error', 7000);
                } else {
                    Utils.showToast(`Total hours must be exactly 8. Current total: ${totalWithExisting} hours. You need ${8 - totalWithExisting} more hours.`, 'error', 7000);
                }
                Utils.setLoading(false);
                return;
            }
            
            // Validate each row
            for (let i = 0; i < AppState.timesheetRows.length; i++) {
                const row = AppState.timesheetRows[i];
                if (!row.project || !row.task || !row.billingType) {
                    Utils.showToast(`Row ${i+1}: Please fill Project, Task, and Billing Type`, 'error', 7000);
                    return;
                }
            }
            
            formData['Date'] = entryDate;
            formData.timesheetRows = AppState.timesheetRows;
        } else {
            const leaveData = {
                leaveType: document.getElementById('leaveType').value,
                session: document.getElementById('session').value,
                fromDate: document.getElementById('leaveFromDate').value,
                toDate: document.getElementById('leaveToDate').value,
                description: document.getElementById('leaveDescription').value
            };
            
            if (!Validator.validateLeaveEntry(leaveData)) {
                return;
            }
            
            // VALIDATION: Check if work already submitted for these dates
            const fromDate = new Date(leaveData.fromDate);
            const toDate = new Date(leaveData.toDate);
            
            for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const status = API.checkDateLeaveStatus(dateStr);
                
                // Check if work hours already submitted
                if (status.workHours > 0) {
                    Utils.showToast(`Cannot apply leave. You have already submitted ${status.workHours} hours of work for ${dateStr}. Please contact admin to modify.`, 'error', 7000);
                    Utils.setLoading(false);
                    return;
                }
                
                // Check for overlapping leave
                if (status.hasFullLeave || status.hasPartialLeave) {
                    Utils.showToast('Leave already applied for overlapping dates. Please check your existing leave entries.', 'error', 7000);
                    Utils.setLoading(false);
                    return;
                }
            }
            
            Object.assign(formData, {
                'Date': leaveData.fromDate,
                'Leave Type': leaveData.leaveType,
                'Session': leaveData.session,
                'From Date': leaveData.fromDate,
                'To Date': leaveData.toDate,
                'Description': leaveData.description
            });
        }
        
        await API.submitEntry(formData);
        
        Utils.showToast('Entry submitted successfully!');
        AppState.timesheetRows = [];
        UI.renderTimesheetRows();
        document.getElementById('timesheetForm').reset();
        
    } catch (error) {
        Utils.showToast(error.message || 'Failed to submit entry', 'error');
    } finally {
        Utils.setLoading(false);
    }
});

// Reset form button
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the form?')) {
        UI.resetForm();
    }
});

// View entries button
document.getElementById('viewEntriesBtn').addEventListener('click', async () => {
    try {
        Utils.setLoading(true);
        
        // Fetch fresh data from server
        await API.fetchEntries(AppState.userEmail);
        
        UI.populateEntriesTable(AppState.entries);
        document.getElementById('entriesModal').classList.add('active');
    } catch (error) {
        Utils.showToast('Failed to load entries', 'error');
    } finally {
        Utils.setLoading(false);
    }
});

// Entry type filter
document.getElementById('entryTypeFilter').addEventListener('change', (e) => {
    UI.filterEntries(e.target.value);
});

// Close modal
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('entriesModal').classList.remove('active');
});

// Close modal on outside click
document.getElementById('entriesModal').addEventListener('click', (e) => {
    if (e.target.id === 'entriesModal') {
        document.getElementById('entriesModal').classList.remove('active');
    }
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        AppState.userEmail = '';
        AppState.otpToken = '';
        AppState.entries = [];
        UI.resetForm();
        Utils.switchScreen('login');
        document.getElementById('loginEmail').value = '';
        Utils.showToast('Logged out successfully');
    }
});

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    UI.initOTPInputs();
    
    // Set default email for direct access
    document.getElementById('userEmail').textContent = AppState.userEmail;
    
    // Set max date to today for work entry date input
    const today = new Date().toISOString().split('T')[0];
    const entryDateInput = document.getElementById('entryDate');
    if (entryDateInput) {
        entryDateInput.max = today;
    }
    
    // Set max date for leave dates (will be overridden by leave type selection)
    const leaveFromDate = document.getElementById('leaveFromDate');
    const leaveToDate = document.getElementById('leaveToDate');
    if (leaveFromDate) leaveFromDate.max = today;
    if (leaveToDate) leaveToDate.max = today;
    
    // Disable weekends in all date pickers
    const disableWeekends = (e) => {
        const date = new Date(e.target.value);
        const day = date.getDay();
        if (day === 0 || day === 6) {
            e.target.value = '';
            Utils.showToast('Weekends (Saturday and Sunday) are not allowed', 'error', 5000);
        }
    };
    
    if (entryDateInput) entryDateInput.addEventListener('change', disableWeekends);
    if (leaveFromDate) leaveFromDate.addEventListener('change', disableWeekends);
    if (leaveToDate) leaveToDate.addEventListener('change', disableWeekends);
    
    // Load draft
    const draft = localStorage.getItem('timesheetDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            if (entryDateInput) entryDateInput.value = data.date;
            AppState.timesheetRows = data.rows || [];
            UI.renderTimesheetRows();
        } catch (e) {}
    }
    
    console.log('Timesheet Application initialized');
    console.log('Config:', CONFIG);
});


// Global functions for timesheet table
window.updateTimesheetRow = (idx, field, value) => {
    AppState.timesheetRows[idx][field] = value;
};

window.updateTimesheetHours = (idx, value) => {
    const newHours = parseFloat(value) || 0;
    const selectedDate = document.getElementById('entryDate').value;
    
    if (!selectedDate) {
        AppState.timesheetRows[idx].hours = newHours;
        UI.updateTotalHours();
        return;
    }
    
    // Get existing hours for this date (from server + leave)
    const status = API.checkDateLeaveStatus(selectedDate);
    
    // Calculate current form hours (excluding the row being edited)
    const currentFormHours = AppState.timesheetRows.reduce((sum, row, i) => {
        if (i !== idx) return sum + (parseFloat(row.hours) || 0);
        return sum;
    }, 0);
    
    // Total = existing (work + leave) + current form hours + new hours
    const totalHours = status.totalHours + currentFormHours + newHours;
    
    if (totalHours > 8) {
        const remaining = 8 - status.totalHours - currentFormHours;
        Utils.showToast(`Cannot exceed 8 hours. Already logged: ${status.totalHours} hrs. Current form: ${currentFormHours} hrs. Maximum allowed: ${remaining} hrs.`, 'error', 7000);
        AppState.timesheetRows[idx].hours = 0;
        document.querySelectorAll('#timesheetBody input[type="number"]')[idx].value = 0;
    } else {
        AppState.timesheetRows[idx].hours = newHours;
    }
    
    UI.updateTotalHours();
};

window.deleteTimesheetRow = (idx) => {
    AppState.timesheetRows.splice(idx, 1);
    UI.renderTimesheetRows();
};

// Add Row button
document.getElementById('addRowBtn')?.addEventListener('click', () => {
    UI.addTimesheetRow();
});

// Date change listener with immediate validation
document.getElementById('entryDate')?.addEventListener('change', async (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
        const date = new Date(selectedDate + 'T00:00:00');
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
        document.getElementById('selectedDay').textContent = dayName + ', ' + date.toLocaleDateString();
        
        // Fetch latest entries and validate
        try {
            await API.fetchEntries(AppState.userEmail);
            const status = API.checkDateLeaveStatus(selectedDate);
            
            if (status.hasFullLeave) {
                // Full day leave - disable timesheet entry
                Utils.showToast('Leave already applied for this date. Timesheet submission is not allowed.', 'error', 7000);
                document.getElementById('addRowBtn').disabled = true;
                AppState.timesheetRows = [];
                AppState.canSubmit = false;
                UI.renderTimesheetRows();
            } else if (status.hasPartialLeave) {
                // Partial leave - show remaining hours
                Utils.showToast(`You have already applied ${status.leaveHours} hours leave. You can submit only ${status.remainingHours} hours timesheet.`, 'warning', 7000);
                document.getElementById('addRowBtn').disabled = false;
                AppState.maxAllowedHours = status.remainingHours;
                AppState.canSubmit = true;
                UI.updateTotalHours();
            } else {
                // No leave - enable normal entry
                document.getElementById('addRowBtn').disabled = false;
                AppState.maxAllowedHours = 8;
                AppState.canSubmit = true;
                UI.updateTotalHours();
            }
        } catch (error) {
            console.error('Error validating date:', error);
        }
    } else {
        document.getElementById('selectedDay').textContent = '';
        document.getElementById('addRowBtn').disabled = false;
        AppState.maxAllowedHours = 8;
    }
});



// Leave type change listener - dynamic date validation
document.getElementById('leaveType')?.addEventListener('change', (e) => {
    const leaveType = e.target.value;
    const fromDateInput = document.getElementById('leaveFromDate');
    const toDateInput = document.getElementById('leaveToDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (leaveType === 'Casual Leave') {
        // Allow future dates for Casual Leave
        fromDateInput.removeAttribute('max');
        toDateInput.removeAttribute('max');
    } else {
        // Restrict to today or past dates for other leave types
        fromDateInput.max = today;
        toDateInput.max = today;
    }
});


// Save button
document.getElementById('saveBtn')?.addEventListener('click', async () => {
    try {
        Utils.setLoading(true);
        localStorage.setItem('timesheetDraft', JSON.stringify({
            date: document.getElementById('entryDate').value,
            rows: AppState.timesheetRows
        }));
        Utils.showToast('Changes saved!');
    } catch (error) {
        Utils.showToast('Failed to save', 'error');
    } finally {
        Utils.setLoading(false);
    }
});

// Load draft on page load
document.addEventListener('DOMContentLoaded', () => {
    const draft = localStorage.getItem('timesheetDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            document.getElementById('entryDate').value = data.date;
            AppState.timesheetRows = data.rows || [];
            UI.renderTimesheetRows();
        } catch (e) {}
    }
});
