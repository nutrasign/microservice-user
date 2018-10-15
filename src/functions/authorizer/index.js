import jwt from 'jsonwebtoken'
import * as util from 'util'

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {}
  authResponse.principalId = principalId
  if (effect && resource) {
    const policyDocument = {}
    policyDocument.Version = '2012-10-17'
    policyDocument.Statement = []
    const statementOne = {}
    statementOne.Action = 'execute-api:Invoke'
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }
  return authResponse
}

const handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  if (!event.authorizationToken) {
    return callback('Unauthorized')
  }
  const token = event.authorizationToken
  try {
    console.log('debug event', util.inspect(event, {showHidden: false, depth: null}))
    console.log('TOKEN', token)
    const options = {
      algorithm: process.env.SIGN_ALGORITHM
    }
    console.log('DECODE', jwt.decode(token, process.env.TOKEN_SECRET))
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET, options)
    console.log('AUTH OK')
    return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn))
  } catch (error) {
    console.log('Unauthorized', error.toString())
    context.fail('Unauthorized')
  }
}

export {
  handler
}
