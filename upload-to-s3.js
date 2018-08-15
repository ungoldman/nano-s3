var awsConfig = require('./awsConfig');
var signature = require('./signature');

function sendToS3(filename, data, mime, cb) {
  cb = cb || function() {};
  var form = new FormData();
  form.append('key', [awsConfig.uploadPath, filename].join(''));
  form.append('policy', awsConfig.policy);
  form.append('Content-Type', mime);
  form.append('signature', signature);
  form.append('AWSAccessKeyId', awsConfig.accessKey);
  form.append('acl', 'public-read');
  form.append('file', data);  //in the browser this is an instance of Blob(), IIRC this should be a Buffer 
  return $.ajax({
    type: 'POST',
    url: awsConfig.awsHostTarget,
    data: form,
    contentType: false,
    processData: false,
    success: function() {
      cb();
    },
    faiure: function(xhr, status, err) {
      console.log(status, err);
      cb(err);
    },
    statusCode: {
      400: function(xhr, status, err) {
        console.log(status, err);
        console.log(xhr.responseText);
        cb(err);
      },
      403: function(xhr, status, err) {
        console.log(status, err);
        console.log(xhr.responseText);
        cb(err);
      },
      405: function(xhr, status, err) {
        console.log(status, err);
        console.log(xhr.responseText);
        cb(err);
      }
    }
  });
}
