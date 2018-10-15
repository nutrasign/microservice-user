import * as util from 'util'
import bcrypt from 'bcryptjs'
import AWS from 'aws-sdk'

const ENV = process.env
const REGION = ENV.REGION || 'eu-west-1'
AWS.config.region = REGION
const kycBucket = 'users-dev-images'
const s3Bucket = new AWS.S3({params: {Bucket: kycBucket}})

const uploadBinaryImage = async ({
                                   folderName,
                                   contentType,
                                   image,
                                   imagePrivate
                                 }) => {
  const extension = contentType.split('/')['1'] || 'png'
  const timestamp = new Date().getTime()
  const finalName = `${folderName}/${timestamp}.${extension}`
  const data = {
    Key: finalName,
    Body: Buffer.from(image, 'base64'), // Buffer.from(image), // ,
    ContentEncoding: 'base64',
    ContentType: contentType,
    ACL: imagePrivate ? 'private' : 'public-read'
  }
  try {
    await s3Bucket.putObject(data).promise()
    return {
      key: finalName,
      contentEncoding: 'base64',
      contentType,
      acl: 'public-read',
      url: `https://s3-eu-west-1.amazonaws.com/${kycBucket}/${finalName}`
    }
  } catch (error) {
    console.log(error)
    console.log(`kycBucket ${kycBucket}`)
    console.log('S3 ERROR', error.toString())
    return {
      url: `https://s3.amazonaws.com/${kycBucket}/${finalName}`,
      error: error.toString()
    }
  }
}

const onResult = ({result, callback}) => {
  let response
  response = {
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
    },
    statusCode: 200,
    body: JSON.stringify(result || {})
  }

  callback(null, response)
}

const onMixResult = ({result, callback}) => {
  let response
  response = {
    headers: {
      'Content-Type': 'text/html', // HTML
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
    },
    statusCode: 200,
    body: result.data || ''
  }
  callback(null, response)
}

const onError = ({error = {}, options = {}, callback}) => {
  console.log('debug RESULT', util.inspect(error, {showHidden: false, depth: null}))
  const response = {
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
    },
    statusCode: 400,
    body: JSON.stringify({
      message: error.message || error.toString() || 'Internal error'
    })
  }
  callback(null, response)
}

const onInvalidRequest = ({callback, event}) => {
  const response = {
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
    },
    statusCode: 405,
    body: JSON.stringify({
      event
    })
  }
  callback(null, response)
}

const encryptWithBcrypt = ({plainText}) => {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(plainText, salt)
  return {salt, hash}
}

const maybeJSON = (value) => {
  if (typeof value === 'string') {
    try {
      const json = JSON.parse(value)
      return json
    } catch (error) {
      return {}
    }
  }
  if (value !== null && typeof value === 'object') {
    return value
  }
  return {}
}

const getKeyFromSecretsManager = async ({secretName}) => {
  const client = new AWS.SecretsManager({
    endpoint: `https://secretsmanager.${REGION}.amazonaws.com`,
    region: REGION
  })
  const data = await client.getSecretValue({SecretId: secretName}).promise()
  if (data.SecretString !== '') {
    return data.SecretString
  }
  return data.SecretBinary
}

const isValidHashWithBcrypt = ({originalValue, hash}) => {
  return bcrypt.compareSync(originalValue, hash)
}

export {
  onResult,
  onMixResult,
  onError,
  onInvalidRequest,
  encryptWithBcrypt,
  isValidHashWithBcrypt,
  maybeJSON,
  getKeyFromSecretsManager,
  uploadBinaryImage
}
