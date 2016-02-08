// before running this script
//   # create a folder 'หนังสือรับรอง' in Google Drive

function onSubmit(e) {
  responses = getResponses(e);
  var name = responses[0];
  var url = convertToDownload(responses[2]);
  var superName = responses[4];
  var superEmail = responses[5];
  
  // save image to drive
  saveUrlToDrive(url, 'หนังสือรับรอง', name);   
  
  // mail superviser
  supUrl = 'https://docs.google.com/forms/d/1szyyOUzpxPcRrok1D4026vaV5K5iHI7TFF9p2iZ8-o8/viewform?entry.1142428611=supname&entry.1139297885=worker'
           .replace('supname', superName)
           .replace('worker', name)
  MailApp.sendEmail(superEmail, 'ผู้บังยืนยัน', 'เรียน ' + superName + '\n\n'
                   + 'ตามที่ ' + encodeURI(supUrl));
}

// get reponses from event object of form submit
function getResponses(e) {
  var resp = e.response.getItemResponses();
  var responses = []
  for (i = 0; i < resp.length; i++)
     responses.push(resp[i].getResponse());
  return responses;
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
  // or
  //   https://drive.google.com/file/d/0B5fYc4W5XmgZemFSb3p1M2p0MGc/view?usp=sharing
  //   to
  //   https://drive.google.com/uc?export=download&id=0B5fYc4W5XmgZemFSb3p1M2p0MGc

  if (url.slice(-4) == 'dl=0') {
    // dropbox
    url = url.slice(0, -4) + 'dl=1';
  } else if (url.indexOf('//cloudbox.ku.ac.th') != -1) {
    // cloudbox
    if (url.slice(-1 * '&download'.length) != '&download') {
  	  url += '&download';
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
