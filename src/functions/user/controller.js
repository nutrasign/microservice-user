import * as db from './../../db'
import * as validators from './validators'
import { encryptWithBcrypt, isValidHashWithBcrypt } from './../utils'
import * as joi from 'joi'

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
  // TODO: don`t allow email, username taken
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
      salt
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

  // const user = await db.executeQuery({
  //   resource: '/getUserByEmail',
  //   input: {
  //     email
  //   }
  // })
  //
  // console.log('USER', user)
  //
  // if (!user) {
  //   throw new Error('Invalid User')
  // }
  //
  // const isPasswordCorrect = isValidHashWithBcrypt({originalValue: password, hash: user.hashedPassword})
  // if (!isPasswordCorrect) {
  //   throw new Error('Invalid Password')
  // }

  return {
    id: 'cjmoxvqhj0001pp4iznypqptd'
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

const addProvider = async ({input}) => {
  const {error, value: params} = validators.addProvider(input)
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

const getProviders = async ({input}) => {
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
  getProviders
}
