import * as util from 'util'
import { onResult, onError, onInvalidRequest, maybeJSON } from './../utils'
import * as controller from './controller'
import get from 'lodash.get'
import jwt from 'jsonwebtoken'

const collectionHandlers = {
  '/users': {
    'GET': controller.getUsers,
    'POST': ({event}) => {
      return controller.addUser({input: event.body})
    }
  },
  '/user/{id}': {
    'GET': ({event}) => {
      return controller.getUserById({input: event.pathParameters})
    },
    'PUT': ({event}) => {
      return controller.updateUserById({
        input: {
          ...maybeJSON(event.pathParameters),
          ...maybeJSON(event.body)
        }
      })
    },
    'DELETE': ({event}) => {
      return controller.deleteUserById({input: event.pathParameters})
    }
  },
  '/login': {
    'POST': ({event}) => {
      return controller.login({input: event.body})
    }
  },
  '/providers': {
    'POST': ({event}) => {
      return controller.addProvider({input: event.body})
    }
  },
  '/clients': {
    'POST': ({event}) => {
      return controller.addClient({input: event.body})
    }
  },
  '/purchases': {
    'POST': ({event}) => {
      return controller.addPurchase({input: event.body})
    }
  },
  '/products': {
    'POST': ({event}) => {
      return controller.addProduct({input: event.body})
    }
  },
  '/providers/{userId}': {
    'GET': ({event}) => {
      return controller.getProviders({input: event.pathParameters})
    }
  },
  '/clients/{userId}': {
    'GET': ({event}) => {
      return controller.getClients({input: event.pathParameters})
    }
  },
  '/purchases/{userId}': {
    'GET': ({event}) => {
      return controller.getPurchases({input: event.pathParameters})
    }
  },
  '/products/{userId}': {
    'GET': ({event}) => {
      return controller.getProducts({input: event.pathParameters})
    }
  },
  '/miscellaneous/add-image': {
    'POST': ({event}) => {
      return controller.addImage({
        image: event.body,
        contentType: event.headers['Content-Type'],
      })
    }
  }
}

const getAuth = ({event}) => {
  const token = (get(event, 'headers.Authorization') || get(event, 'headers.authorization')).split(' ')[1]
  if (!token) {
    return {}
  }
  try {
    console.log('DECODE', jwt.decode(token, process.env.TOKEN_SECRET))
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET, {
      algorithm: process.env.SIGN_ALGORITHM
    })
    return Object.assign({}, decoded)
  } catch (error) {
    console.log(error)
    throw new Error('Unauthorized')
  }
}

const router = async (event, context, callback) => {
  console.log('debug event USER', util.inspect(event, {showHidden: false, depth: null}))
  // console.log('debug context USER', util.inspect(context, {showHidden: false, depth: null}))
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
      const auth = getAuth({event})
      console.log(auth)
      const result = await collectionHandlers[resource][httpMethod]({event, context, auth})
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
