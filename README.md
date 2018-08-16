# nano-s3 [![stability][0]][1]

[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Upload a file to S3.

[0]: https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/nano-s3.svg?style=flat-square
[3]: https://npmjs.org/package/nano-s3
[4]: https://img.shields.io/travis/toddself/nano-s3/master.svg?style=flat-square
[5]: https://travis-ci.org/toddself/nano-s3
[8]: http://img.shields.io/npm/dm/nano-s3.svg?style=flat-square
[9]: https://npmjs.org/package/nano-s3
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard

## About

Sometimes you just need a small lib to do a simple task.

## Installation

```
npm install nano-s3
```

## Usage

```js
const fs = require('fs')
const path = require('path')
const nanoS3 = require('nano-s3')

const options = {
  // AWS Config
  accessKeyId: 'abc',
  secretAccessKey: 'xyz',
  host: 's3.us-west-1.amazonaws.com',
  bucket: 'your-bucket-name',

  // file info
  filename: 'image.jpg', // this will be the name of the uploaded file on S3
  contentType: `image/jpeg`, // MIME type of file
  data: fs.readFileSync(path.join(__dirname, 'image.jpg')), // this should be a Buffer
  path: 'path/in/bucket', // directory path in bucket to upload to (optional)

  // max file size, defaults to 2MB (optional). required by AWS for upload policy.
  maxFileSize: 2 * 1024 * 1024
}

nanoS3(options, function (err, res) {
  if (err) throw err
  console.log(res.statusCode, res.statusMessage)
})
```

## API

### `nanoS3(options, cb)`

Params:
- `options` - *Object*:
  - `accessKeyId` - *String*: AWS access key ID with write access to the host and bucket.
  - `secretAccessKey` - *String*: AWS secret access key for signing.
  - `host` - *String*: AWS host to upload the files to, e.g. `s3-us-west-2.amazonaws.com`.
  - `bucket` - *String*: Your AWS bucket name.
  - `maxFileSize` - *Number*: Max file size (optional). Default: 2MB (`2 * 1024 * 1024`).
  - `filename` - *String*: Name of file to upload.
  - `path` - *String*: Path in bucket to upload to (optional). Default: none (root).
  - `contentType` - *String*: MIME type of file.
  - `data` - *Buffer*: File data. Should be a Buffer.
- `cb` - *Function*:
  - `err` - *Error*: `null` if everything went fine, `Error` object if something went wrong.
  - `res` - [*Response*](https://nodejs.org/api/http.html#http_class_http_serverresponse): `http` response object.

## License

[ISC](LICENSE.md)
