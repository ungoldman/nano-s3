const nanoS3 = require('./')
const test = require('tape')

test('required keys', t => {
  t.plan(2)
  nanoS3(null, err => {
    t.ok(err, 'Returns Error on missing params')
    t.ok(/^Missing required option/.test(err.message), err.message)
  })
})

test('required types', t => {
  t.plan(2)
  nanoS3({
    protocol: 0,
    host: 0,
    bucket: 0,
    accessKeyId: 0,
    secretAccessKey: 0,
    maxFileSize: '1',
    filename: 0,
    path: 0,
    contentType: 0,
    data: 'x'
  }, err => {
    t.ok(err, 'Returns Error on missing params')
    t.ok(/^Invalid option/.test(err.message), err.message)
  })
})

test('works?', t => {
  t.plan(3)
  nanoS3({
    protocol: 'https',
    host: 's3.amazonaws.com',
    bucket: 'nano-s3-test-bad-bucket',
    accessKeyId: 'xyz789',
    secretAccessKey: 'abc123',
    filename: 'badfile.txt',
    contentType: 'text/plain',
    data: Buffer.from('plain text\n')
  }, (err, res) => {
    t.error(err, 'No Error No Cry')
    t.equals(res.statusCode, 403, 'good status (403)')
    t.equals(res.statusMessage, 'Forbidden', 'good message (Forbidden)')
  })
})
