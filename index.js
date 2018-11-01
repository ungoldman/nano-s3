const crypto = require('crypto')
const FormData = require('form-data')
const isBuffer = require('is-buffer')

module.exports = nanoS3

/**
 * Upload a file to S3.
 * @param  {object} options - upload options
 * @param  {function} cb - callback
 */
function nanoS3 (options, cb) {
  options = options || {}
  cb = cb || function () {}

  const err = validate(options)
  if (err) return cb(err)

  const {
    // protocol for URL, default is https
    protocol = 'https',

    // AWS host to upload the files to, e.g. `s3.us-west-1.amazonaws.com`
    host,

    // your AWS bucket name
    bucket,

    // AWS access key ID with write access to the host and bucket
    accessKeyId,

    // AWS secret access key for signing
    secretAccessKey,

    // max file size, default 2MB
    maxFileSize = 2 * 1024 * 1024,

    // Name of uploaded file on S3
    filename,

    // Path in bucket to upload to (optional)
    path,

    // MIME Type of file
    contentType,

    // File data (Buffer)
    data
  } = options

  const form = new FormData()

  // Full URL to the bucket.
  const target = `${protocol}://${host}/${bucket}`

  // Policy expiration. Currently set to five years from time of upload.
  const expiration = getExpiration()

  // Full path to file in bucket.
  const key = path ? [path.replace(/\/$/, ''), filename].join('/') : filename

  // Policy for uploading -- this is the restrictions we give to the upload form
  // and then sign so that we can detect if someone has tampered with it.
  // This is a mildly restrictive policy -- we cap the upload at 2MB unless overridden.
  // The date is five years in the future -- you will need to generate a new policy
  // and upload a new version of this file before this date and time!
  // Everything consumes the policy in a base64 format, but we need to make it
  // into a JSON string first.
  const policy = btoa(JSON.stringify({
    expiration,
    conditions: [
      { bucket: bucket },
      { acl: 'public-read' },
      ['content-length-range', 0, maxFileSize],
      ['starts-with', '$Content-Type', ''],
      ['starts-with', '$key', '']
    ]
  }))

  // Signed policy.
  const signature = getSignature(secretAccessKey, policy)

  form.append('key', key)
  form.append('policy', policy)
  form.append('Content-Type', contentType)
  form.append('signature', signature)
  form.append('AWSAccessKeyId', accessKeyId)
  form.append('acl', 'public-read')
  form.append('file', data)

  form.submit(target, cb)
}

/**
 * base64 encode a string.
 * @param  {string} text - string to encode
 * @return {string} - encoded string
 */
function btoa (text) {
  return Buffer.from(text, 'utf8').toString('base64')
}

/**
 * Generate an AWS V1 signature for our policy using our secret key.
 * @param   {string} key - Your amazon secret key
 * @param   {string} policy - A base-64 encoded version of your policy
 * @returns {buffer} An HMAC-SHA1 encoded version of your policy using your key
 */
function getSignature (key, policy) {
  return crypto.createHmac('sha1', key).update(policy).digest().toString('base64')
}

/**
 * Returns ISO date string for five years from now.
 * @return {string} ISO date string
 */
function getExpiration () {
  const d = new Date()
  d.setDate(d.getDate() + 365 * 5)
  return d.toISOString()
}

/**
 * Option validation for main export.
 * @param  {object} options - nanoS3 options
 * @return {null|Error} - null if everything went fine, Error if something went wrong
 */
function validate (options) {
  const required = [
    'host',
    'bucket',
    'accessKeyId',
    'secretAccessKey',
    'filename',
    'contentType',
    'data'
  ]

  const missing = required.filter(key => options[key] == null)

  if (missing.length > 0) {
    return new Error(`Missing required option(s): ${missing.join(', ')}`)
  }

  const requiredTypes = {
    protocol: isString,
    host: isString,
    bucket: isString,
    accessKeyId: isString,
    secretAccessKey: isString,
    maxFileSize: isNumber,
    filename: isString,
    path: isString,
    contentType: isString,
    data: isBuffer
  }

  const badTypes = Object.keys(options).filter(key => !requiredTypes[key](options[key]))

  if (badTypes.length > 0) {
    return new Error(`Invalid option(s): ${badTypes.join(', ')}`)
  }

  return null

  function isString (v) { return typeof v === 'string' }
  function isNumber (v) { return typeof v === 'number' }
}
