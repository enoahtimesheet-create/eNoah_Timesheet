// Web App Entry Point
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'sendOTP') {
      return sendOTPEmail(data.email);
    } else if (data.action === 'verifyOTP') {
      return verifyOTP(data.email, data.otp);
    } else if (data.action === 'submitEntry') {
      return submitTimesheetEntry(data.data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Invalid action'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getEntries') {
    return getTimesheetEntries(e.parameter.email);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Invalid action'})).setMimeType(ContentService.MimeType.JSON);
}

// ==================== OTP FUNCTIONS ====================

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTPEmail(email) {
  try {
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    
    storeOTP(email, otp, expiryTime);
    
    const subject = 'eNoah Timesheet - Your OTP Code';
    const body = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #ff9800;">eNoah Timesheet Login</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #ff9800; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">eNoah iSolution - Timesheet System</p>
        </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body
    });
    
    return ContentService.createTextOutput(JSON.stringify({success: true, otp: otp})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function storeOTP(email, otp, expiryTime) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const otpSheet = getOrCreateSheet(ss, 'OTP_Tokens');
  
  if (otpSheet.getLastRow() === 0) {
    otpSheet.appendRow(['Email', 'OTP', 'Expiry Time', 'Created At']);
  }
  
  const data = otpSheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === email) {
      otpSheet.deleteRow(i + 1);
    }
  }
  
  otpSheet.appendRow([email, otp, expiryTime, new Date()]);
}

function verifyOTP(email, otp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const otpSheet = ss.getSheetByName('OTP_Tokens');
    
    if (!otpSheet) {
      return ContentService.createTextOutput(JSON.stringify({success: false, error: 'No OTP found'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = otpSheet.getDataRange().getValues();
    const now = new Date();
    const otpStr = String(otp).trim();
    
    for (let i = 1; i < data.length; i++) {
      const storedEmail = String(data[i][0]).trim();
      const storedOTP = String(data[i][1]).trim();
      
      if (storedEmail === email && storedOTP === otpStr) {
        const expiryTime = new Date(data[i][2]);
        
        if (now > expiryTime) {
          otpSheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({success: false, error: 'OTP has expired'})).setMimeType(ContentService.MimeType.JSON);
        }
        
        otpSheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Invalid OTP'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function cleanupExpiredOTPs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const otpSheet = ss.getSheetByName('OTP_Tokens');
  
  if (!otpSheet) return;
  
  const data = otpSheet.getDataRange().getValues();
  const now = new Date();
  
  for (let i = data.length - 1; i > 0; i--) {
    const expiryTime = new Date(data[i][2]);
    if (now > expiryTime) {
      otpSheet.deleteRow(i + 1);
    }
  }
}

// ==================== TIMESHEET FUNCTIONS ====================

function submitTimesheetEntry(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const email = data['Email Address'];
    const entryDate = data['Date'];
    
    // Check if it's a leave entry
    if (data['Leave Type']) {
      // VALIDATION 1: Check for existing leave on the same date
      const leaveSheet = getOrCreateSheet(ss, 'Leave');
      if (leaveSheet.getLastRow() > 1) {
        const leaveData = leaveSheet.getDataRange().getValues();
        for (let i = 1; i < leaveData.length; i++) {
          if (leaveData[i][1] === email) {
            const existingFrom = new Date(leaveData[i][2]);
            const existingTo = new Date(leaveData[i][3]);
            const newFrom = new Date(data['From Date']);
            const newTo = new Date(data['To Date']);
            
            // Check for date overlap
            if ((newFrom >= existingFrom && newFrom <= existingTo) || 
                (newTo >= existingFrom && newTo <= existingTo) ||
                (newFrom <= existingFrom && newTo >= existingTo)) {
              return ContentService.createTextOutput(JSON.stringify({
                success: false, 
                error: 'Leave already applied for overlapping dates. Please check your existing leave entries.'
              })).setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
      
      // Handle Leave Entry - Insert in BOTH sheets
      const sheet1 = getOrCreateSheet(ss, 'Sheet1');
      if (sheet1.getLastRow() === 0) {
        sheet1.appendRow([
          'Timestamp', 'Email Address', 'eNoah Email ID', 'Date',
          'Project Name', 'Task', 'Task Type', 'Hours Spent',
          'Work Description', 'Attendance', 'Leave Type', 'Session',
          'From Date', 'To Date'
        ]);
      }
      
      // Calculate leave hours
      const sessionHours = data['Session'].includes('Full Day') ? 8 : 4;
      const fromDate = new Date(data['From Date']);
      const toDate = new Date(data['To Date']);
      const dayCount = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
      const totalLeaveHours = sessionHours * dayCount;
      
      const sheet1Row = [
        data['Timestamp'], data['Email Address'], data['Enter your eNoah email ID'],
        data['Date'], '', '', '', '', '', '',
        data['Leave Type'], data['Session'], data['From Date'], data['To Date']
      ];
      sheet1.appendRow(sheet1Row);
      
      // Insert in Leave sheet
      if (leaveSheet.getLastRow() === 0) {
        leaveSheet.appendRow([
          'Submitted Date', 'Email ID', 'From Date', 'To Date',
          'Day Count', 'Leave Type', 'Session', 'Description'
        ]);
      }
      
      const leaveRow = [
        data['Timestamp'], data['Email Address'], data['From Date'],
        data['To Date'], dayCount, data['Leave Type'],
        data['Session'], data['Description']
      ];
      leaveSheet.appendRow(leaveRow);
      
      Logger.log('Added leave entry to both Sheet1 and Leave sheet');
      
    } else {
      // VALIDATION 2: Check for leave conflict before work entry
      const leaveSheet = getOrCreateSheet(ss, 'Leave');
      if (leaveSheet.getLastRow() > 1) {
        const leaveData = leaveSheet.getDataRange().getValues();
        for (let i = 1; i < leaveData.length; i++) {
          if (leaveData[i][1] === email) {
            const leaveFrom = new Date(leaveData[i][2]);
            const leaveTo = new Date(leaveData[i][3]);
            const workDate = new Date(entryDate);
            
            if (workDate >= leaveFrom && workDate <= leaveTo) {
              return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: 'Timesheet cannot be submitted. Leave already applied for this date.'
              })).setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
      
      // VALIDATION 3: Check total hours for the date (leave + work <= 8)
      const sheet1 = getOrCreateSheet(ss, 'Sheet1');
      let existingHours = 0;
      
      if (sheet1.getLastRow() > 1) {
        const sheet1Data = sheet1.getDataRange().getValues();
        for (let i = 1; i < sheet1Data.length; i++) {
          if ((sheet1Data[i][1] === email || sheet1Data[i][2] === email) && 
              formatDate(sheet1Data[i][3]) === formatDate(entryDate)) {
            existingHours += parseFloat(sheet1Data[i][7]) || 0;
          }
        }
      }
      
      // Calculate new work hours
      let newWorkHours = 0;
      if (data.timesheetRows && data.timesheetRows.length > 0) {
        data.timesheetRows.forEach(function(tsRow) {
          newWorkHours += parseFloat(tsRow.hours) || 0;
        });
      }
      
      const totalHours = existingHours + newWorkHours;
      if (totalHours > 8) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Total hours exceed allowed limit. You have ' + existingHours + ' hours already logged (including leave). Remaining: ' + (8 - existingHours) + ' hours.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Handle Work Entry
      if (sheet1.getLastRow() === 0) {
        sheet1.appendRow([
          'Timestamp', 'Email Address', 'eNoah Email ID', 'Date',
          'Project Name', 'Task', 'Task Type', 'Hours Spent',
          'Work Description', 'Attendance'
        ]);
      }
      
      if (data.timesheetRows && data.timesheetRows.length > 0) {
        data.timesheetRows.forEach(function(tsRow) {
          const row = [
            data['Timestamp'], data['Email Address'], data['Enter your eNoah email ID'],
            data['Date'], tsRow.project || '', tsRow.task || '',
            tsRow.billingType || '', parseFloat(tsRow.hours) || 0, tsRow.description || '', 'Working'
          ];
          sheet1.appendRow(row);
          Logger.log('Added work row with hours: ' + tsRow.hours);
        });
      }
      
      consolidateData();
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in submitTimesheetEntry: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTimesheetEntries(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const workSheet = getOrCreateSheet(ss, 'Sheet1');
    const leaveSheet = getOrCreateSheet(ss, 'Leave');
    
    const entries = [];
    
    // Get work entries
    const workData = workSheet.getDataRange().getValues();
    for (let i = 1; i < workData.length; i++) {
      if (workData[i][1] === email || workData[i][2] === email) {
        // Skip if no project name (likely a leave entry in Sheet1)
        if (!workData[i][4]) continue;
        
        entries.push({
          'Timestamp': formatTimestamp(workData[i][0]),
          'Email Address': workData[i][1],
          'Date': formatDate(workData[i][3]),
          'Project Name': workData[i][4],
          'Task': workData[i][5],
          'Task Type': workData[i][6],
          'Hours Spent': workData[i][7],
          'Work Description': workData[i][8],
          'Attendance': workData[i][9],
          'Entry Type': 'Work'
        });
      }
    }
    
    // Get leave entries
    const leaveData = leaveSheet.getDataRange().getValues();
    for (let i = 1; i < leaveData.length; i++) {
      if (leaveData[i][1] === email) {
        entries.push({
          'Timestamp': formatTimestamp(leaveData[i][0]),
          'Email Address': leaveData[i][1],
          'From Date': formatDate(leaveData[i][2]),
          'To Date': formatDate(leaveData[i][3]),
          'Day Count': leaveData[i][4],
          'Leave Type': leaveData[i][5],
          'Session': leaveData[i][6],
          'Description': leaveData[i][7],
          'Entry Type': 'Leave'
        });
      }
    }
    
    // Sort by timestamp descending (newest first)
    entries.sort(function(a, b) {
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });
    
    return ContentService.createTextOutput(JSON.stringify({success: true, entries: entries})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString(), entries: []})).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== CONSOLIDATION LOGIC ====================

function onFormSubmit(e) {
  consolidateData();
}

function consolidateData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const formSheet = getOrCreateSheet(ss, 'Sheet1');
  const leaveSheet = getOrCreateSheet(ss, 'Leave');
  const consolidatedSheet = getOrCreateSheet(ss, 'Consolidated');
  
  if (consolidatedSheet.getLastRow() === 0) {
    consolidatedSheet.appendRow(['Email ID', 'Date', 'Submitted Time', 'Total Hours']);
  }
  
  const formData = formSheet.getDataRange().getValues();
  Logger.log('Total rows in Sheet1: ' + (formData.length - 1));
  
  if (formData.length <= 1) return;
  
  const grouped = {};
  
  for (let i = 1; i < formData.length; i++) {
    const row = formData[i];
    const timestamp = row[0];
    const email = row[1] || row[2];
    const date = row[3];
    const projectName = row[4];
    const hours = parseFloat(row[7]) || 0;
    
    // Skip leave entries (no project name)
    if (!projectName) {
      Logger.log('Row ' + i + ': Skipping leave entry');
      continue;
    }
    
    Logger.log('Row ' + i + ': Email=' + email + ', Date=' + date + ', Hours=' + hours);
    
    if (!email || !date) {
      Logger.log('  Skipping - missing email or date');
      continue;
    }
    
    const dateStr = formatDate(date);
    const key = email + '|' + dateStr;
    
    if (!grouped[key]) {
      grouped[key] = {
        email: email,
        date: dateStr,
        timestamp: timestamp,
        totalHours: 0
      };
      Logger.log('  Created new group for key: ' + key);
    }
    
    grouped[key].totalHours += hours;
    Logger.log('  Added ' + hours + ' hours. New total: ' + grouped[key].totalHours);
    
    if (new Date(timestamp) > new Date(grouped[key].timestamp)) {
      grouped[key].timestamp = timestamp;
    }
  }
  
  Logger.log('\nGrouped data:');
  for (const key in grouped) {
    Logger.log(key + ' => Total Hours: ' + grouped[key].totalHours);
  }
  
  if (consolidatedSheet.getLastRow() > 1) {
    consolidatedSheet.getRange(2, 1, consolidatedSheet.getLastRow() - 1, 4).clearContent();
  }
  
  const consolidatedData = [];
  for (const key in grouped) {
    const item = grouped[key];
    consolidatedData.push([
      item.email,
      item.date,
      formatTimestamp(item.timestamp),
      item.totalHours
    ]);
  }
  
  if (consolidatedData.length > 0) {
    consolidatedSheet.getRange(2, 1, consolidatedData.length, 4).setValues(consolidatedData);
  }
  
  Logger.log('\nConsolidation complete. Total entries: ' + consolidatedData.length);
}

// ==================== HELPER FUNCTIONS ====================

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function formatDate(date) {
  if (date instanceof Date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM/dd/yyyy');
  }
  return date;
}

function formatTimestamp(timestamp) {
  if (timestamp instanceof Date) {
    return Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'MM/dd/yyyy HH:mm:ss');
  }
  return timestamp;
}

// Manual test function
function testConsolidation() {
  Logger.log('Starting consolidation...');
  consolidateData();
  Logger.log('Done! Check Consolidated sheet.');
}
