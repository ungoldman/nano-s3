'use strict';

var fs = require('fs');
var crypto = require('crypto');
var awsConfig = require('./awsConfig');

/**
 * Generate an AWS V1 signature for our policy using our secret key
 * @method  exports
 * @param   {string} key Your amazon secret key
 * @param   {string} policy A base-64 encoded version of your policy
 * @returns {buffer} An HMAC-SHA1 encoded version of your policy using your key
 */
var signPolicy = module.exports = function(key, policy){
  return crypto.createHmac('sha1', key).update(policy).digest();
};

if(!process.env.AMAZON_SECRET_ACCESS_KEY){
  console.log('You must specify your secret acceess key via the environment with AMAZON_SECRET_ACCESS_KEY');
  process.exit(1);
}
console.log('Signing', awsConfig.policy);

var signature = signPolicy(process.env.AMAZON_SECRET_ACCESS_KEY, awsConfig.policy);
var sigFile = 'module.exports = "'+signature.toString('base64')+'";\n';
fs.writeFile('app/signature.js', sigFile, 'utf8', function(err){
  if(err){
    console.log(err);
    process.exit(1);
  }
  console.log('Wrote signature file: app/signature.js');
});
