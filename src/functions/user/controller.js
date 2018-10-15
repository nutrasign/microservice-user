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

const addClient = async ({input}) => {
  const {error, value: params} = validators.addClient(input)
  if (error) {
    throw error
  }
  const {
    name,
    code,
    address,
    postalCode,
    city,
    country,
    commercialContactName,
    commercialContactRol,
    commercialContactEmail,
    commercialContactPhone,
    emergencyContactName,
    emergencyContactRol,
    emergencyContactEmail,
    emergencyContactPhone,
    certificates
  } = params
  return {
    name,
    code,
    address,
    postalCode,
    city,
    country,
    commercialContactName,
    commercialContactRol,
    commercialContactEmail,
    commercialContactPhone,
    emergencyContactName,
    emergencyContactRol,
    emergencyContactEmail,
    emergencyContactPhone,
    certificates
  }
}

const addPurchase = async ({input}) => {
  const {error, value: params} = validators.addPurchase(input)
  if (error) {
    throw error
  }
  const {
    userId,
    providerName,
    showProvider,
    documentDate,
    documentType,
    documentNumber,
    products
  } = params
  return {
    userId,
    showProvider,
    providerName,
    documentDate,
    documentType,
    documentNumber,
    products
  }
}

const addProduct = async ({input}) => {
  const {error, value: params} = validators.addProduct(input)
  if (error) {
    throw error
  }
  const {
    userId,
    name,
    barcode,
    sanitaryRegistration,
    specialCares,
    stock,
    description,
    urlImages,
    urlVideo,
    ingredients,
    nutritionalValues
  } = params
  return {
    userId,
    name,
    barcode,
    sanitaryRegistration,
    specialCares,
    stock,
    description,
    urlImages,
    urlVideo,
    ingredients,
    nutritionalValues
  }
}

const getPurchases = async ({input}) => {
  const {error, value: params} = validators.getByUserId(input)
  if (error) {
    throw error
  }
  const {
    userId,
  } = params
  return [
    {
      'providerName': 'Coca Cola',
      'documentDate': '31-10-2018',
      'documentType': 'PRE',
      'documentNumber': '1234',
      'products': [
        {
          'name': 'Tomate',
          'expirationDate': '31-10-2018',
          'barcode': '123456789',
          'quantity': 10,
          'price': 2000
        }
      ]
    }
  ]
}

const getClients = async ({input}) => {
  const {error, value: params} = validators.getByUserId(input)
  if (error) {
    throw error
  }
  const {
    userId,
  } = params
  return [
    {
      'name': 'Coca Cola',
      'code': '12345',
      'address': 'Rivas',
      'postalCode': '12345',
      'city': 'SJ',
      'country': 'CR',
      'commercialContactName': '',
      'commercialContactRol': '',
      'commercialContactEmail': '',
      'commercialContactPhone': '',
      'emergencyContactName': '',
      'emergencyContactRol': '',
      'emergencyContactEmail': '',
      'emergencyContactPhone': '',
      'certificates': [
        {
          'name': 'ISO-2000',
          'number': '1234567'
        }
      ]
    }
  ]
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

const getProducts = async ({input}) => {
  const {error, value: params} = validators.getByUserId(input)
  if (error) {
    throw error
  }
  const {
    userId,
  } = params
  return [
    {
      'userId': 'ABC',
      'name': 'Leche Descremada',
      'barcode': '123456789',
      'sanitaryRegistration': 'CE2012',
      'specialCares': 'Mantener en refrigeración a menos de 10 grados centígrados',
      'stock': 100,
      'description': 'Leche de vaca descremada',
      'urlImages': [
        {
          'url': 'https://merkazone.com/wp-content/uploads/2018/02/400x400-Leche-DESCREMADA.png',
          'priority': 0
        }
      ],
      'urlVideo': '',
      'ingredients': [
        {
          'name': 'Leche',
          'quantity': 100,
          'quantityUnit': 'gramos'
        }
      ],
      'nutritionalValues': [
        {
          'proportion': 100,
          'name': 'leche',
          'quantity': 100,
          'percent': 100
        }
      ]
    }
  ]
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
  addImage
}
