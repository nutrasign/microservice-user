import Redis from 'ioredis'
import cuid from 'cuid'
import { getKeyFromSecretsManager, maybeJSON } from '../functions/utils'

let globalRedisInstance

const getRedisClient = async () => {
  if (!globalRedisInstance) {

    if (!process.env.STAGE || !process.env.APP) {
      throw new Error('STAGE or APP is not SET, can\'t initialize db')
    }

    const secretName = `${process.env.STAGE}/${process.env.APP}/db-cache`
    console.log(`Looking for key: ${secretName}`)

    let config = await getKeyFromSecretsManager({secretName})
    config = maybeJSON(config)
    globalRedisInstance = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      showFriendlyErrorStack: true,
      db: 0,
      keyPrefix: 'NS_'
    })
  }
  return globalRedisInstance
}

const addUser = async ({
                         username,
                         email,
                         hashedPassword,
                         name,
                         role,
                         company,
                         description,
                         status
                       }) => {
  try {
    const id = cuid()
    const redisInstance = await getRedisClient()
    await redisInstance.hset(['AUTH:USERNAME', username, `${hashedPassword}:${id}:${status}`])
    await redisInstance.hset(['AUTH:EMAIL', email, `${hashedPassword}:${id}:${status}`])
    await redisInstance.hset(['USERS', id, JSON.stringify({
      id,
      username,
      hashedPassword,
      name,
      role,
      company,
      description,
      status
    })])
    return {
      id,
      email,
      username,
      name,
      role,
      company,
      description,
      status
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

const deleteUserById = async ({
                                id
                              }) => {
  try {
    const redisInstance = await getRedisClient()
    let user = await redisInstance.hget(['USERS', id])
    if (user) {
      user = JSON.parse(user)
      user.status = 0
      const {username, email, hashedPassword} = user
      await redisInstance.hset(['AUTH:USERNAME', username, `${hashedPassword}:${id}:0`])
      await redisInstance.hset(['AUTH:EMAIL', email, `${hashedPassword}:${id}:0`])
      await redisInstance.hset(['USERS', id, JSON.stringify(user)])
      return user
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getUserCredentialsByEmail = async ({
                                           email
                                         }) => {
  try {
    const redisInstance = await getRedisClient()
    return redisInstance.hget(['AUTH:EMAIL', email])
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getUserById = async ({
                             id
                           }) => {
  try {
    const redisInstance = await getRedisClient()
    const user = await redisInstance.hget(['USERS', id])
    return user ? JSON.parse(user) : undefined
  } catch (error) {
    console.error(error)
    throw error
  }
}

const updateUserById = async ({
                                id,
                                name,
                                role,
                                company,
                                description
                              }) => {
  try {
    const redisInstance = await getRedisClient()
    let user = await redisInstance.hget(['USERS', id])
    if (user) {
      user = JSON.parse(user)
      user.name = name || user.name
      user.role = role || user.role
      user.company = company || user.company
      user.description = description || user.description
      await redisInstance.hset(['USERS', id, JSON.stringify(user)])
    }
    return user
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getUsers = async () => {
  try {
    let users = []
    const redisInstance = await getRedisClient()
    const rowUsers = await redisInstance.hvals(['USERS'])
    if (!rowUsers || !rowUsers.length) {
      return users
    }
    const max = rowUsers.length
    for (let i = 0; i < max; ++i) {
      const currentUser = rowUsers[i]
      if (currentUser) {
        users.push(JSON.parse(currentUser))
      }
    }
    return users
  } catch (error) {
    console.error(error)
    throw error
  }
}

const addProvider = async ({
                             internalUserId,
                             provider: values
                           }) => {
  try {
    const id = cuid()
    const redisInstance = await getRedisClient()
    const finalValue = {
      id,
      ...values
    }
    await redisInstance.hset([`PROVIDERS:${internalUserId}`, id, JSON.stringify(finalValue)])
    return finalValue
  } catch (error) {
    console.error(error)
    throw error
  }
}

const addPurchase = async ({
                             internalUserId,
                             purchase: values
                           }) => {
  try {
    const id = cuid()
    const redisInstance = await getRedisClient()
    const finalValue = {
      id,
      ...values
    }
    await redisInstance.hset([`PURCHASES:${internalUserId}`, id, JSON.stringify(finalValue)])
    return finalValue
  } catch (error) {
    console.error(error)
    throw error
  }
}

const addProduct = async ({
                            internalUserId,
                            product: values
                          }) => {
  try {
    const id = cuid()
    const redisInstance = await getRedisClient()
    const finalValue = {
      id,
      ...values
    }
    await redisInstance.hset([`PRODUCTS:${internalUserId}`, id, JSON.stringify(finalValue)])
    return finalValue
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getPurchases = async ({
                              internalUserId
                            }) => {
  try {
    const redisInstance = await getRedisClient()
    const values = await redisInstance.hvals([`PURCHASES:${internalUserId}`])

    return values.map((value) => {
      return JSON.parse(value)
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getProducts = async ({
                             internalUserId
                           }) => {
  try {
    const redisInstance = await getRedisClient()
    const values = await redisInstance.hvals([`PRODUCTS:${internalUserId}`])

    return values.map((value) => {
      return JSON.parse(value)
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getProviders = async ({
                              internalUserId
                            }) => {
  try {
    const redisInstance = await getRedisClient()
    const values = await redisInstance.hvals([`PROVIDERS:${internalUserId}`])

    return values.map((value) => {
      return JSON.parse(value)
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const addClient = async ({
                           internalUserId,
                           client: values
                         }) => {
  try {
    const id = cuid()
    const redisInstance = await getRedisClient()
    const finalValue = {
      id,
      ...values
    }
    await redisInstance.hset([`CLIENTS:${internalUserId}`, id, JSON.stringify(finalValue)])
    return finalValue
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getClients = async ({
                            internalUserId
                          }) => {
  try {
    const redisInstance = await getRedisClient()
    const values = await redisInstance.hvals([`CLIENTS:${internalUserId}`])

    return values.map((value) => {
      return JSON.parse(value)
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const collectionHandlers = {
  '/addUser': addUser,
  '/deleteUserById': deleteUserById,
  '/updateUserById': updateUserById,
  '/getUserById': getUserById,
  '/getUsers': getUsers,
  '/getUserCredentialsByEmail': getUserCredentialsByEmail,
  '/addProvider': addProvider,
  '/getProviders': getProviders,
  '/addPurchase': addPurchase,
  '/getPurchases': getPurchases,
  '/addProduct': addProduct,
  '/getProducts': getProducts,
  '/addClient': addClient,
  '/getClients': getClients
}

const isDisconnection = (error) => {
  const disconnected = error && (error.message === 'ResourceRequest timed out' ||
    error.toString().includes('ResourceRequest timed out') || error.toString().includes('EHOSTUNREACH'))
  console.log('ns-error', disconnected)
  return disconnected
}

const resetRedisClient = async () => {
  console.log('resetRedisClient')
  globalRedisInstance = undefined
}

const execute = async ({payload}) => {
  const {resource, input} = payload

  if (!collectionHandlers[resource]) {
    throw new Error()
  }

  try {
    console.log('execute 1', resource)
    const result = await collectionHandlers[resource](input)
    return result
  } catch (error) {
    if (isDisconnection(error)) {
      console.log('ns-error', 'ResourceRequest timed out REDIS')
      await resetRedisClient()
      try {
        const result = await collectionHandlers[resource](input)
        return result
      } catch (error) {
        if (isDisconnection(error)) {
          console.log('ns-error', 'ResourceRequest timed out REDIS')
          console.log('FORCE SET REDIS POOL UNDEFINED')
          await resetRedisClient()
        }
        throw error
      }
    } else {
      throw error
    }
  }
}

const executeQuery = async (payload = {}) => {
  let result
  try {
    result = await execute({payload})
    return result
  } catch (error) {
    console.log('sn-error', 'executeREDISQuery', error)
    if (error && error.code && error.code !== 'general-22') {
      console.log('w-code-error-redis', error.code)
    }
    throw error
  }
}

export {
  executeQuery
}
