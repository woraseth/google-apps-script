var ADDON_TITLE = 'ดาวน์โหลดไฟล์ไปเก็บที่ Google Drive';
 
function TT() {
  var response = UrlFetchApp.fetch('http://upload.wikimedia.org/wikipedia/commons/6/6e/FractalLandscape.jpg');
  var blob = response.getBlob();
  Logger.log(blob.getContentType());
  var file = DriveApp.createFile(response);
}

function tt() {
  Logger.log(PropertiesService.getDocumentProperties().getProperties());
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
  var pref = PropertiesService.getDocumentProperties().getProperties();

  var form = FormApp.getActiveForm();
  var textItems = form.getItems(FormApp.ItemType.TEXT);
  pref.textItems = [];
  for (var i = 0; i < textItems.length; i++) {
    pref.textItems.push({
      title: textItems[i].getTitle(),
      id: textItems[i].getId()
    });
  }
  
  return pref;
}

function savePref(pref) {
  if (pref.enable)
    FormApp.getActiveForm().setCollectEmail(true);
  PropertiesService.getDocumentProperties().setProperties(pref);
  adjustFormSubmitTrigger();
}

function adjustFormSubmitTrigger() {
  var form = FormApp.getActiveForm();
  var triggers = ScriptApp.getUserTriggers(form);
  var pref = PropertiesService.getDocumentProperties().getProperties();
  var triggerNeeded = pref.enable === 'true';

  // find an existing trigger
  var existingTrigger = null;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == 'onVacUpdateAddOnFormSubmitEvent') {
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
    var trigger = ScriptApp.newTrigger('onVacUpdateAddOnFormSubmitEvent')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
}

function onVacUpdateAddOnFormSubmitEvent(e) {
  /*
  var pref = PropertiesService.getDocumentProperties().getProperties();
  var url = convertToDownload('http://www.dropbox.com/s/g9jtm390l67uqkb/128.png?dl=0');
  //var url = convertToDownload('https://www.dropbox.com/s/oiiuzyeb4g3w2om/02.jpg?dl=0');
  //var url = convertToDownload('https://cloudbox.ku.ac.th/public.php?service=files&t=40c18f033dd5358de33ae720847fed56');
  Logger.log(url);
  saveUrlToDrive(url, 'abc', 'a');  
  */
  var pref = PropertiesService.getDocumentProperties().getProperties();
  var urlItem = e.source.getItemById(parseInt(pref.url));
  var url = convertToDownload(e.response.getResponseForItem(urlItem).getResponse());
  var filename = e.response.getRespondentEmail();
  saveUrlToDrive(url, pref.folder, filename);  

  addAds();
}

function addAds() {
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  if (items[items.length - 1].getType() != FormApp.ItemType.SECTION_HEADER) {
    var item = form.addSectionHeaderItem();
    item.setTitle('ข้อมูลปลอดภัยใน Cloud Box');
    item.setHelpText('http://cloudbox.ku.ac.th (ฟรีพื้นที่ 10GB สำหรับชาวเกษตร)');
  }
}

function saveUrlToDrive(url, foldername, filename) {
  var response = UrlFetchApp.fetch(url);
  var blob = response.getBlob();
  Logger.log(blob.getContentType());
  var file = DriveApp.createFile(blob);
  file.setName(filename + '.' + blob.getContentType().split('/')[1]);
  
  var folderIt = DriveApp.getFoldersByName(foldername);
  var folder = folderIt.hasNext() ? folderIt.next() : DriveApp.createFolder(foldername);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}

function convertToDownload(url) {
  // convert
  //   https://www.dropbox.com/s/v66wvckwpcznsp6/lock.png?dl=0
  //   to
  //   https://www.dropbox.com/s/v66wvckwpcznsp6/lock.png?dl=1
  // or
  //   https://drive.google.com/file/d/0B5fYc4W5XmgZemFSb3p1M2p0MGc/view?usp=sharing
  //   to
  //   https://drive.google.com/uc?export=download&id=0B5fYc4W5XmgZemFSb3p1M2p0MGc
  // or
  //   https://cloudbox.ku.ac.th/index.php/s/1RA3zf7aDgVTsBo
  //   to
  //   https://cloudbox.ku.ac.th/index.php/s/1RA3zf7aDgVTsBo/download

  if (url.slice(-4) == 'dl=0') {
    // dropbox
    url = url.slice(0, -4) + 'dl=1';
  } else if (url.indexOf('//cloudbox.ku.ac.th') != -1) {
    // cloudbox
    if (url.slice(-1 * '/download'.length) != '/download') {
  	  url += '/download';
    }
  } else if (url.indexOf('//drive.google') != -1) {
    // G drive
    var url = 'https://drive.google.com/file/d/0B5fYc4W5XmgZemFSb3p1M2p0MGc/view?usp=sharing';
    var s1 = url.lastIndexOf('/');
    var s0 = url.substring(0, s1).lastIndexOf('/');
    var id = url.substring(s0 + 1, s1);
    url = 'https://drive.google.com/uc?export=download&id=' + id;
  }
  return url;
}



