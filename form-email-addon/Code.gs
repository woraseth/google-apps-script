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

  var triggerNeeded = pref.enable_r === 'true' || pref.enable_c === 'true' || pref.enable_o === 'true';

  // delete all existing triggers
  for (var i = triggers.length - 1; i >= 0; i--) {
    if (triggers[i].getHandlerFunction() == 'onVacEmailAddOnFormSubmitEvent') {
      var existingTrigger = triggers[i];
      ScriptApp.deleteTrigger(existingTrigger);
    }
  }
  
  if (triggerNeeded) {
    // add a new trigger if needed
    var trigger = ScriptApp.newTrigger('onVacEmailAddOnFormSubmitEvent')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
}

function onVacEmailAddOnFormSubmitEvent(e) {
  var pref = PropertiesService.getDocumentProperties().getProperties();
  if (pref.enable_r === 'true') {
    try {
      MailApp.sendEmail(e.response.getRespondentEmail(), pref.subject_r, applyTemplate(pref.msg_r, getResponses(e)));
    } catch (ex) {}
  }
  if (pref.enable_c === 'true') {
    try {
      MailApp.sendEmail(e.source.getEditors()[0].getEmail(), pref.subject_c, applyTemplate(pref.msg_c, getResponses(e)));
    } catch (ex) {}
  }
  if (pref.enable_o === 'true') {
    var resp = getResponses(e);
    try {
      MailApp.sendEmail(applyTemplate(pref.email_o, resp), pref.subject_o, applyTemplate(pref.msg_o, resp));
    } catch (ex) {}
  }
}

//--------------------------------------------------------------------------------------------
// get reponses from event object of form submit
function getResponses(e) {
  /*
  var resp = e.response.getItemResponses();
  var responses = []
  for (i = 0; i < resp.length; i++)
     responses.push(resp[i].getResponse());
  */
  var form = e.source;
  var items = form.getItems();
  var responses = [];
  for (i = 0; i < items.length; i++) {
    var r = e.response.getResponseForItem(items[i]);
    responses.push(r == null ? '' : r.getResponse());
  }
  return responses;
}

function applyTemplate(msg, resp) {
  for (var i = 0; i < resp.length; i++) {
    var key = '{' + (i+1) + '}';
    msg = msg.split(key).join(resp[i]);
  }
  for (var i = 0; i < resp.length; i++) {
    var key = '{url(' + (i+1) + ')}';
    msg = msg.split(key).join(encodeURI(resp[i]));
  }
  return msg;
}

//--------------------------------------------------------------------------------------------

function addAds() {
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  if (items[items.length - 1].getType() != FormApp.ItemType.SECTION_HEADER) {
    var item = form.addSectionHeaderItem();
    item.setTitle('ข้อมูลปลอดภัยใน Cloud Box');
    item.setHelpText('http://cloudbox.ku.ac.th (ฟรีพื้นที่ 10GB สำหรับชาวเกษตร)');
  }
}
