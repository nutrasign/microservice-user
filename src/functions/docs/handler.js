import * as util from 'util'
import { onMixResult, onError, onInvalidRequest } from './../utils'
import docs from './../docs/index'

const collectionHandlers = {
  '/': {
    'GET': async () => {
      return docs()
    }
  }
}

const router = async (event, context, callback) => {
  console.log('debug event', util.inspect(event, {showHidden: false, depth: null}))
  console.log('debug context', util.inspect(context, {showHidden: false, depth: null}))
  context.callbackWaitsForEmptyEventLoop = false

  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }

  const {
    resource, httpMethod
  } = event

  if (collectionHandlers[resource][httpMethod]) {
    try {
      const result = await collectionHandlers[resource][httpMethod]({event, context})
      return onMixResult({result, callback})
    } catch (error) {
      return onError({error, options: {requestId: context.awsRequestId}, callback})
    }
  } else {
    return onInvalidRequest(callback, event)
  }
}

export {
  router
}
