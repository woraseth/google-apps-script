var ADDON_TITLE = 'ส่งเมลเมื่อฟอร์มถูก submit';

function onOpen(e) {
  FormApp.getUi()
      .createAddonMenu()
      .addItem('ตั้งค่า', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function openPref() {
  var pref = PropertiesService.getDocumentProperties().getProperties();
  return pref;
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle(ADDON_TITLE);
  FormApp.getUi().showSidebar(ui);
}

function savePref(pref) {
  if (pref.enable_r)
    FormApp.getActiveForm().setCollectEmail(true);
  PropertiesService.getDocumentProperties().setProperties(pref);
  adjustFormSubmitTrigger();
}

function adjustFormSubmitTrigger() {
  var form = FormApp.getActiveForm();
  var triggers = ScriptApp.getUserTriggers(form);
  var pref = PropertiesService.getDocumentProperties().getProperties();

  respondantTrigger(form, triggers, pref);
}

function respondantTrigger(form, triggers, pref) {
  var triggerNeeded = pref.enable_r === 'true';

  // find an existing trigger
  var existingTrigger = null;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == 'onVacEmailRespondantAddOnFormSubmitEvent') {
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
    var trigger = ScriptApp.newTrigger('onVacEmailRespondantAddOnFormSubmitEvent')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
}

function onVacEmailRespondantAddOnFormSubmitEvent(e) {
  var pref = PropertiesService.getDocumentProperties().getProperties();
  MailApp.sendEmail(e.response.getRespondentEmail(), pref.subject_r, applyTemplate(pref.msg_r, getResponses(e)))
}

// get reponses from event object of form submit
function getResponses(e) {
  var resp = e.response.getItemResponses();
  var responses = []
  for (i = 0; i < resp.length; i++)
     responses.push(resp[i].getResponse());
  return responses;
}

function applyTemplate(msg, resp) {
  for (var i = 0; i < resp.length; i++) {
    var key = '{' + (i+1) + '}';
    msg = msg.split(key).join(resp[i]);
  }
  return msg;
}




