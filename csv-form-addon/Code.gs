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

function onSubmit(e) {
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
