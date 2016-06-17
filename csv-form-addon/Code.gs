var ADDON_TITLE = 'CSV field';

function test() {
}

function onOpen(e) {
  FormApp.getUi()
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
  FormApp.getUi().showSidebar(ui);
}

function openPref() {
  return PropertiesService.getDocumentProperties().getProperties();
}

function savePref(pref) {
  PropertiesService.getDocumentProperties().setProperties(pref);
  adjustFormSubmitTrigger();
}

function adjustFormSubmitTrigger() {
  var form = FormApp.getActiveForm();
  var triggers = ScriptApp.getUserTriggers(form);
  var pref = PropertiesService.getDocumentProperties().getProperties();

  // find an existing trigger
  var existingTrigger = null;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == 'onVacCsvFieldAddOnFormSubmitEvent') {
      existingTrigger = triggers[i];
      break;
    }
  }
  
  if (existingTrigger) {
    // delete the existing one
    ScriptApp.deleteTrigger(existingTrigger);
  }
  
  if (pref.enable === 'true') {
    // add new trigger
    var trigger = ScriptApp.newTrigger('onVacCsvFieldAddOnFormSubmitEvent')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
}

function onVacCsvFieldAddOnFormSubmitEvent(e) {
  var csv = findParagraph(e);
  if (csv == null)
    return;
  
  var form = e.source;
  // find destination spreadsheet
  var ss = SpreadsheetApp.openById(getDestId(form));
  // add csvField page if not exist
  var csvSheet = ss.getSheetByName('csvField');
  if (csvSheet == null) {
    ss.insertSheet('csvField')
    csvSheet = ss.getSheetByName('csvField');
  }
  // append CSV data 
  addCSV(csvSheet, e.response.getTimestamp(), csv)  
}

function getDestId(form) {
  try {
    form.getDestinationId();
  } catch(err) {
    var id = SpreadsheetApp.create(form.getTitle() + ' Destination').getId();
    form.setDestination(FormApp.DestinationType.SPREADSHEET, id);
  }
  return form.getDestinationId();
}

function addCSV(sheet, pk, csv) {
  var lines = csv.split('\n');
  for (i = 0; i < lines.length; i++) {
    var row = lines[i].split(',').map(function (x) {return x.trim()});
    row.unshift(pk)
    sheet.appendRow(row);
  }
}

function findParagraph(e) {
  var form = e.source;
  var items = form.getItems();
  for (i = 0; i < items.length; i++) {
    if (items[i].getType() == FormApp.ItemType.PARAGRAPH_TEXT) {
      return e.response.getResponseForItem(items[i]).getResponse();
    }
  }
  return null;
}
