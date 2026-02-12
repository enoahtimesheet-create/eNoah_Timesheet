function sendWeeklyExcelReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fileId = ss.getId();
  
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd-MMM-yyyy");

  // Correct Excel export URL
  const url = "https://docs.google.com/spreadsheets/d/" + fileId + "/export?format=xlsx";

  const token = ScriptApp.getOAuthToken();

  const response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });

  const blob = response.getBlob().setName("Weekly_Timesheet_Report_" + formattedDate + ".xlsx");

  MailApp.sendEmail({
    to: "hariharan.s01@enoahisolution.co.in",  // 🔴 CHANGE THIS
    subject: "Weekly Timesheet Report - " + formattedDate,
    htmlBody: `
      <h3>Weekly Timesheet Report</h3>
      <p>Please find attached the weekly Excel report.</p>
      <p>All sheets are included.</p>
      <br>
      <p>Regards,<br>eNoah Timesheet System</p>
    `,
    attachments: [blob]
  });
}
