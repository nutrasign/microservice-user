import * as util from 'util'
import { onResult, onError, onInvalidRequest, maybeJSON } from './../utils'
import {
  addUser,
  deleteUserById,
  getUsers,
  updateUserById,
  getUserById,
  login,
  addProvider,
  addPurchase,
  addClient
} from './controller'

const collectionHandlers = {
  '/users': {
    'GET': getUsers,
    'POST': ({event}) => {
      return addUser({input: event.body})
    }
  },
  '/user/{id}': {
    'GET': ({event}) => {
      return getUserById({input: event.pathParameters})
    },
    'PUT': ({event}) => {
      return updateUserById({
        input: {
          ...maybeJSON(event.pathParameters),
          ...maybeJSON(event.body)
        }
      })
    },
    'DELETE': ({event}) => {
      return deleteUserById({input: event.pathParameters})
    }
  },
  '/login': {
    'POST': ({event}) => {
      return login({input: event.body})
    }
  },
  '/providers': {
    'POST': ({event}) => {
      return addProvider({input: event.body})
    }
  },
  '/clients': {
    'POST': ({event}) => {
      return addClient({input: event.body})
    }
  },
  '/purchases': {
    'POST': ({event}) => {
      return addPurchase({input: event.body})
    }
  }
}

const router = async (event, context, callback) => {
  console.log('debug event USER', util.inspect(event, {showHidden: false, depth: null}))
  console.log('debug context USER', util.inspect(context, {showHidden: false, depth: null}))
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
      return onResult({result, callback})
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
