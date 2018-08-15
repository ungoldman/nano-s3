'use strict';

// we need to do base64 conversion, in node that's a simple buffer operation,
// but in the browser we can just use the `window.btoa` method.  since this code
// runs in an IIFE, we can define our own btoa for node using buffers, but then
// just override it if we're in the browser, thanks to the `process.browser`
// injected by browserify
function btoa(text){
  return (new Buffer(text)).toString('base64');
}

if(process.browser){
  btoa = window.btoa; //jshint ignore:line
}

// the aws host to upload the files to, e.g. `s3-us-west-2.amazonaws.com`
exports.awsHost = '';

// the aws region, e.g. `us-west-2`
exports.awsRegion = '';

// your aws bucket -- only change the part after the `||` -- this allows this
// variable to be overridden on the command line
exports.awsBucket = process.env.AWS_BUCKET || '';

// this is URL to the bucket -- if you're using a CNAME you'll want to put in the
// cname address here instead, e.g. `http://memes.popbuzz.com` or the uploading
// and referers will not work
exports.awsHostTarget = window.location.protocol + '//' + [exports.awsHost, exports.awsBucket].join('/');

// an aws access key with write access to the awsHost and awsBucket
exports.accessKey = '';

// policy for uploading -- this is the restrictions we give to the upload form
// and then sign so that we can detect if someone has tampered with it. this is
// a mildly restrictive policy -- we cap the upload at 2MB unless overridden
// during the build and policy signing step, and we only allow declared mime-types
// for html files and jpeg images.  The date is one year in the future -- you
// will need to generate a new policy and upload a new version of this file
// before this date and time!
var policy = {
  expiration: '2015-11-18T12:00:00.00Z',
  conditions: [
    { bucket: exports.awsBucket },
    { acl: 'public-read' },
    ['content-length-range', 0, process.env.MAX_FILE_SIZE || 2 * 1024 * 1024],
    ['starts-with', '$Content-Type', ''],
    ['starts-with', '$key', '']
  ]
};

// everything consumes the policy in a base64 format, but we need to make it
// into a JSON string first
exports.policy = btoa(JSON.stringify(policy));

// this is an HMAC digest of our policy signed by our key. for information on
// how to generate the signature please see the readme.
exports.signature = '';

// this is the policy for the bucket that gets sent whenever we do a deploy. this
// explains to the S3 host who is allowed to attempt an upload. we restrict
// the referer to the current bucket name -- if you're using a cname and accessing
// the bucket via that cname, you'll want to change the referer line to
exports.bucketPolicy = {
  Bucket: exports.awsBucket,
  Policy: JSON.stringify({
    Version: '2012-10-17',
    Id: 'upload-from-s3-hosted-site',
    Statement: [{
      Sid: 'allow put requests from the generator',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:PutObject', 's3:PutObjectAcl'],
      Resource: 'arn:aws:s3:::'+exports.awsBucket+'/*',
      Condition: {
        StringLike: {
          'aws:Referer': [
            exports.awsHostTarget+'/*'
          ]
        }
      }
    }]
  })
};