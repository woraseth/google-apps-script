function test() {
  saveUrlToDrive('https://www.dropbox.com/s/v66wvckwpcznsp6/lock.png?dl=1', 'temp', 'lock')
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
  //file.setTrashed(true);
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
  
}


