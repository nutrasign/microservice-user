import * as db from './../../db'
import * as validators from './validators'
import { encryptWithBcrypt, isValidHashWithBcrypt } from './../utils'
import cuid from 'cuid'
import { uploadBinaryImage } from './../utils'
import { USER_STATUS_ACTIVE } from './constants'
import jwt from 'jsonwebtoken'

const getUsers = async () => {
  const users = await db.executeQuery({
    resource: '/getUsers',
    input: {}
  })
  return users
}

const getUserById = async ({input}) => {
  const {error, value: params} = validators.getUserById(input)
  if (error) {
    throw error
  }
  const {id} = params
  const user = await db.executeQuery({
    resource: '/getUserById',
    input: {id}
  })
  return user
}

const updateUserById = async ({input}) => {
  const {error, value: params} = validators.updateUserById(input)
  if (error) {
    throw error
  }
  const {
    id,
    name,
    role,
    company,
    description
  } = params
  const user = await db.executeQuery({
    resource: '/updateUserById',
    input: {
      id,
      name,
      role,
      company,
      description
    }
  })
  return user
}

const getToken = ({internalUserId}) => {
  const token = jwt.sign(
    {
      sub: internalUserId,
      data: {
        internalUserId,
        internalSessionId: cuid(),
        allow: {},
        env: {
          stage: process.env.STAGE,
          region: process.env.REGION
        }
      }
    },
    process.env.TOKEN_SECRET, {
      expiresIn: process.env.SESSION_EXPIRATION,
      algorithm: process.env.SIGN_ALGORITHM
    })
  return token
}

const addUser = async ({input}) => {
  const {error, value: params} = validators.validateUser(input)
  if (error) {
    throw error
  }
  const {
    username,
    email,
    name,
    role,
    company,
    description,
    password
  } = params

  const {salt, hash: hashedPassword} = encryptWithBcrypt({plainText: password})

  const userCredentials = await db.executeQuery({
    resource: '/getUserCredentialsByEmail',
    input: {
      email
    }
  })

  if (userCredentials) {
    throw Error('Email taken')
  }

  const {id} = await db.executeQuery({
    resource: '/addUser',
    input: {
      username,
      email,
      name,
      role,
      company,
      description,
      hashedPassword,
      salt,
      status: USER_STATUS_ACTIVE
    }
  })
  return {
    id,
    username,
    email,
    name,
    role,
    company,
    description
  }
}

const login = async ({input}) => {
  const {error, value: params} = validators.login(input)
  if (error) {
    throw error
  }
  const {
    email,
    password
  } = params

  const userCredentials = await db.executeQuery({
    resource: '/getUserCredentialsByEmail',
    input: {
      email
    }
  })

  console.log('USER', userCredentials)

  if (!userCredentials) {
    throw new Error('Invalid User')
  }

  const [hashedPassword, internalUserId, userStatus] = userCredentials.split(':')

  if (userStatus !== USER_STATUS_ACTIVE) {
    throw new Error('Invalid user status')
  }

  const isPasswordCorrect = isValidHashWithBcrypt({originalValue: password, hash: hashedPassword})
  if (!isPasswordCorrect) {
    throw new Error('Invalid Password')
  }

  const token = getToken({internalUserId})

  return {
    userData: {},
    idToken: token,
    refreshToken: token, // TODO: implement?
    accessToken: token, // TODO: implement?
    accessTokenExpiresAt: 0, // TODO: implement?
    idTokenExpiresAt: 0 // TODO: implement?
  }
}

const deleteUserById = async ({input}) => {
  const {error, value: params} = validators.deleteUserById(input)
  if (error) {
    throw error
  }
  const {id} = params
  const user = await db.executeQuery({
    resource: '/deleteUserById',
    input: {id}
  })
  return user
}

const addProvider = async ({input, auth}) => {
  const {error, value: params} = validators.addProvider(input)
  if (error) {
    throw error
  }

  const {sub: internalUserId} = auth

  const provider = await db.executeQuery({
    resource: '/addProvider',
    input: {
      internalUserId,
      provider: params
    }
  })

  return {
    ...provider
  }
}

const addClient = async ({input, auth}) => {
  const {error, value: params} = validators.addClient(input)
  if (error) {
    throw error
  }

  const {sub: internalUserId} = auth

  const client = await db.executeQuery({
    resource: '/addClient',
    input: {
      internalUserId,
      client: params
    }
  })

  return {
    ...client
  }
}

const addPurchase = async ({input, auth}) => {
  const {error, value: params} = validators.addPurchase(input)
  if (error) {
    throw error
  }

  const {sub: internalUserId} = auth

  const purchase = await db.executeQuery({
    resource: '/addPurchase',
    input: {
      internalUserId,
      purchase: params
    }
  })

  return {
    ...purchase
  }
}

const addProduct = async ({input, auth}) => {
  const {error, value: params} = validators.addProduct(input)
  if (error) {
    throw error
  }

  const {sub: internalUserId} = auth

  const product = await db.executeQuery({
    resource: '/addProduct',
    input: {
      internalUserId,
      product: params
    }
  })

  return {
    ...product
  }
}

const addBirth = async ({input, auth}) => {
  const {error, value: params} = validators.addBirth(input)
  if (error) {
    throw error
  }

  const {sub: internalUserId} = auth

  const product = await db.executeQuery({
    resource: '/addBirth',
    input: {
      internalUserId,
      birth: params
    }
  })

  return {
    ...product
  }
}

const getPurchases = async ({auth}) => {
  const {sub: internalUserId} = auth
  const purchases = await db.executeQuery({
    resource: '/getProviders',
    input: {
      internalUserId
    }
  })
  return purchases
}

const getClients = async ({auth}) => {
  const {sub: internalUserId} = auth
  const clients = await db.executeQuery({
    resource: '/getClients',
    input: {
      internalUserId
    }
  })
  return clients
}

const getProviders = async ({auth}) => {
  const {sub: internalUserId} = auth
  const providers = await db.executeQuery({
    resource: '/getProviders',
    input: {
      internalUserId
    }
  })
  return providers
}

const getProducts = async ({auth}) => {
  const {sub: internalUserId} = auth
  const products = await db.executeQuery({
    resource: '/getProducts',
    input: {
      internalUserId
    }
  })
  return products
}

const getBirths = async ({auth}) => {
  const {sub: internalUserId} = auth
  const products = await db.executeQuery({
    resource: '/getBirths',
    input: {
      internalUserId
    }
  })
  return products
}

const deleteBirth = async ({auth, input}) => {

  const {error, value: params} = validators.getId(input)
  if (error) {
    throw error
  }

  const {sub: internalUserId} = auth
  const products = await db.executeQuery({
    resource: '/deleteBirth',
    input: {
      internalUserId,
      id: params.id
    }
  })
  return products
}

const addImage = async ({image, contentType}) => {
  if (!image || !contentType) {
    return {
      upload: false
    }
  }
  console.log('image')
  const upload = await uploadBinaryImage({
    image,
    contentType,
    folderName: `${cuid()}${cuid()}`
  })
  if (upload.error) {
    throw buildErrorResponse(errorCodes.general.INTERNAL_ERROR, upload.error)
  }
  return {
    upload: true,
    ...upload
  }
}

export {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  addUser,
  login,
  addProvider,
  addClient,
  addPurchase,
  getPurchases,
  getClients,
  getProviders,
  addProduct,
  getProducts,
  addImage,
  addBirth,
  getBirths,
  deleteBirth
}
