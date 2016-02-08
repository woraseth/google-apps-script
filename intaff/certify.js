// before running this script
//   # create a folder 'certify' in Google Drive

function onSubmit(e) {
  var resp = e.response.getItemResponses();
  var url = convertToDownload(resp[5].getResponse());
  var name = resp[0].getResponse();
  var superEmail = resp[4].getResponse();
  var superName = resp[3].getResponse();
  
  // save image to drive
  saveUrlToDrive(url, 'certify', name);   
  
  // mail superviser
  supUrl = 'https://docs.google.com/forms/d/1szyyOUzpxPcRrok1D4026vaV5K5iHI7TFF9p2iZ8-o8/viewform?entry.1142428611=supname&entry.1139297885=worker'
           .replace('supname', superName)
           .replace('worker', name)
  MailApp.sendEmail(superEmail, 'ผู้บังยืนยัน', 'เรียน ' + superName + '\n\n'
                   + 'ตามที่ ' + encodeURI(supUrl));
}

function saveUrlToDrive(url, folder, filename) {
  var response = UrlFetchApp.fetch(url);
  var blob = response.getBlob();
  Logger.log(blob.getContentType());
  var file = DriveApp.createFile(blob);
  file.setName(filename + '.' + blob.getContentType().split('/')[1]);
  
  var folder = DriveApp.getFoldersByName(folder).next();
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}

function convertToDownload(url) {
  // convert
  //   https://www.dropbox.com/s/v66wvckwpcznsp6/lock.png?dl=0
  //   to
  //   https://www.dropbox.com/s/v66wvckwpcznsp6/lock.png?dl=1
  // or
  //   https://cloudbox.ku.ac.th/public.php?service=files&t=7f618ac8474e6a7119ddab1c1e82aa44
  //   to
  //   https://cloudbox.ku.ac.th/public.php?service=files&t=7f618ac8474e6a7119ddab1c1e82aa44&download
  if (url.slice(-4) == 'dl=0') {
    url = url.slice(0, -4) + 'dl=1';
  } else if (url.indexOf('//cloudbox.ku.ac.th') != -1) {
    if (url.slice(-1 * '&download'.length) != '&download') {
  	  url += '&download';
    }
  }
  return url;
}
