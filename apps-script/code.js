/**
 * iPhone Expense Logger - Google Apps Script
 * 
 * This script receives expense data from iPhone Shortcuts
 * and appends it to a Google Sheet.
 * 
 * Setup:
 * 1. Replace SHEET_ID with your Google Sheet ID
 * 2. Deploy as Web App with access "Anyone"
 * 3. Use the deployment URL in your iPhone Shortcut
 * 
 * GitHub: https://github.com/todoitservices/expense-logger
 * Built by: ToDo IT Services (https://instagram.com/todoitservices)
 */

// ⚠️ REPLACE THIS with your Google Sheet ID
const SHEET_ID = 'YOUR_SHEET_ID_HERE';

// Timezone for date formatting (change if needed)
const TIMEZONE = 'Asia/Kolkata';
const LOCALE = 'en-IN';

/**
 * Handles POST requests from iPhone Shortcuts
 * Expected JSON payload: { "amount": "100", "description": "Grocery", "who": "Name" }
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.amount) {
      return createResponse('Error: Amount is required');
    }
    
    // Append row with timestamp
    sheet.appendRow([
      new Date().toLocaleString(LOCALE, { timeZone: TIMEZONE }),
      data.amount,
      data.description || '',
      data.who || 'Unknown'
    ]);
    
    return createResponse('OK');
    
  } catch (error) {
    // Log error to sheet for debugging
    logError(error, e);
    return createResponse('Error: ' + error.message);
  }
}

/**
 * Handles GET requests (for testing in browser)
 * Visit your deployment URL to test if the script is working
 */
function doGet(e) {
  // If parameters provided, treat as expense entry
  if (e.parameter.amount) {
    try {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      
      sheet.appendRow([
        new Date().toLocaleString(LOCALE, { timeZone: TIMEZONE }),
        e.parameter.amount || '0',
        e.parameter.description || '',
        e.parameter.who || 'Unknown'
      ]);
      
      return createResponse('OK');
      
    } catch (error) {
      return createResponse('Error: ' + error.message);
    }
  }
  
  // Default response for browser test
  return createResponse('Expense Logger is running! Use POST method to add expenses.');
}

/**
 * Creates a text response for the client
 */
function createResponse(message) {
  return ContentService.createTextOutput(message);
}

/**
 * Logs errors to the sheet for debugging
 */
function logError(error, event) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    sheet.appendRow([
      new Date().toLocaleString(LOCALE, { timeZone: TIMEZONE }),
      'ERROR',
      error.message,
      event?.postData?.contents || 'No data'
    ]);
  } catch (e) {
    // Silent fail if logging fails
    console.error('Failed to log error:', e);
  }
}

/**
 * Test function - run this to verify your Sheet ID is correct
 */
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('✅ Connected to sheet: ' + sheet.getName());
    console.log('✅ Sheet ID is valid!');
  } catch (error) {
    console.log('❌ Error: ' + error.message);
    console.log('❌ Please check your SHEET_ID');
  }
}
