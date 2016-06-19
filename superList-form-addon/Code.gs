var ADDON_TITLE = 'Super List';

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
    if (triggers[i].getHandlerFunction() == 'onVacSuperListAddOnFormSubmitEvent') {
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
    var trigger = ScriptApp.newTrigger('onVacSuperListAddOnFormSubmitEvent')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
}

//-------------------------------------------------------------------
// form
//-------------------------------------------------------------------
function onVacSuperListAddOnFormSubmitEvent(e) {
  var form = e.source;
  var response = e.response;
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    if (items[i].getType() == FormApp.ItemType.LIST) { 
      if (response.getResponseForItem(items[i]) == null) {
        var text = response.getResponseForItem(items[i+1]).getResponse().trim();
        if (text.length > 0) {
          updateSheet(form, items[i].asListItem(), text);
          updateForm(form, items[i].asListItem(), text);
        }
      }
    }
  }  
}

// update spreadsheet data
function updateForm(form, listItem, text) {
  var choices = listItem.getChoices();
  var i = choices.length - 1;
  for (; i >= 0; i--) {
    if (choices[i].getValue().toLowerCase() < text.toLowerCase()) {
      break;
    }
  }
  choices.splice(i+1, 0, listItem.createChoice(text));
  listItem.setChoices(choices);
}

// update spreadsheet data
function updateSheet(form, listItem, text, i) {
  // find destination spreadsheet
  var ss = SpreadsheetApp.openById(getDestId(form));
  // add a page if not exist
  var sheetName = listItem.getTitle();
  var sheet = ss.getSheetByName(sheetName);
  if (sheet == null) {
    ss.insertSheet(sheetName)
    sheet = ss.getSheetByName(sheetName);
    sheet.appendRow([listItem.getChoices()[0].getValue()]);
  }
  // append CSV data 
  findAndUpdate(sheet, text)  
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

//-------------------------------------------------------------------
// spreadsheet
//-------------------------------------------------------------------
function open(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow == 0) {
    return [];
  }
  
  var range = sheet.getRange(1, 1, lastRow);
  var values = range.getValues();
  var a = [];
  for (var i = 0; i < values.length; i++) {
    a.push(values[i][0]);
  }
  return a;
}

function save(sheet, data) {
  for (var i = 0; i < data.length; i++) {
    sheet.appendRow([data[i]])
  }
}

function findAndUpdate(sheet, val) {
  var array = open(sheet);
  var found = false;
  for (var i = 0; i < array.length; i++) {
    //if (String(array[i]).toLowerCase() == String(val).toLowerCase()) {
    if (String(array[i]) == String(val)) {
      found = true;
      break;
    }
  }
  if (!found) {
    array.push(val);
    sheet.clear();
    //array.sort();
    save(sheet, array);
  }
}

