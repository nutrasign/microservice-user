import * as util from 'util'
import bcrypt from 'bcryptjs'
import AWS from 'aws-sdk'

const ENV = process.env
const REGION = ENV.REGION || 'eu-west-1'
AWS.config.region = REGION

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
    body: JSON.stringify(error)
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

export {
  onResult,
  onMixResult,
  onError,
  onInvalidRequest,
  encryptWithBcrypt,
  maybeJSON,
  getKeyFromSecretsManager
}
