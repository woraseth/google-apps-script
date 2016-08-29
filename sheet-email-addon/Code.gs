function test() {
  var pref = PropertiesService.getDocumentProperties().getProperties();
  Logger.log(pref);
}

function testPref() {
  var form = FormApp.getActiveForm(); 
  var resp = form.getResponses();
  for (var i = 0; i < resp.length; i++) {
    var item = resp[i].getResponseForItem(form.getItems()[2]);
    Logger.log(item.getResponse());
  }
}

var ADDON_TITLE = 'แจ้งเตือนทางอีเมล';


function onOpen(e) {
  SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem('ตั้งค่า', 'showSidebar')
      .addToUi();
}


function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle(ADDON_TITLE);
  SpreadsheetApp.getUi().showSidebar(ui);
}

function savePref(pref) {
  PropertiesService.getDocumentProperties().setProperties(pref);
  adjustFormSubmitTrigger();
}

function openPref() {
  return PropertiesService.getDocumentProperties().getProperties();
}

function adjustFormSubmitTrigger() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var triggers = ScriptApp.getUserTriggers(sheet);
  var pref = PropertiesService.getDocumentProperties().getProperties();
  var triggerNeeded = pref.notify === 'true';

  // find an existing trigger
  var existingTrigger = null;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == 'onVacEmailAddOnEvent') {
      existingTrigger = triggers[i];
      break;
    }
  }
  
  if (existingTrigger) {
    // delete the existing one
    ScriptApp.deleteTrigger(existingTrigger);
  }
  
  if (triggerNeeded) {
    // add a new trigger if needed
    var d = pref.date.split('-');
    var trigger = ScriptApp.newTrigger('onVacEmailAddOnEvent')
        .timeBased()
        .atDate(parseInt(d[2], 10), parseInt(d[1], 10), parseInt(d[0], 10))
        .create();
  }
}

function onVacEmailAddOnEvent(e) {
  var settings = PropertiesService.getDocumentProperties();
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);

  if (authInfo.getAuthorizationStatus() == ScriptApp.AuthorizationStatus.REQUIRED) {
    sendReauthorizationRequest();
  } else {
    if (settings.getProperty('notify') === 'true' && MailApp.getRemainingDailyQuota() > 0) {
      sendRespondentNotification();
    }
  }
}

function sendReauthorizationRequest() {
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
          'Authorization Required',
          ADDON_TITLE);
}

function sendRespondentNotification() {
  var pref = PropertiesService.getDocumentProperties().getProperties();
  var emailColumn = pref.email_col.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  var values = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
  
  for (var i = 1; i < values.length; i++) {
    try {
      var email = values[i][emailColumn];
      MailApp.sendEmail(email, pref.subject, pref.msg);
    } catch (ex) {}
  }
  
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 
                    'แจ้งเตือนทุกท่านแล้ว', 
                    'แจ้งเตือนไปยังทุกอีเมลในชีท ' + SpreadsheetApp.getActiveSpreadsheet().getName() +' แล้ว')
}
