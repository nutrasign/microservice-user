import Redis from 'ioredis'
import cuid from 'cuid'
import { getKeyFromSecretsManager, maybeJSON } from '../functions/utils'

let client

const getClient = async () => {
  if (!client) {

    if (!process.env.STAGE || !process.env.APP) {
      throw new Error('STAGE or APP is not SET, can\'t initialize db')
    }

    const secretName = `${process.env.STAGE}/${process.env.APP}/db-cache`
    console.log(`Looking for key: ${secretName}`)

    let config = await getKeyFromSecretsManager({secretName})
    config = maybeJSON(config)

    console.log('CREATE REDIS CLIENT', {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      showFriendlyErrorStack: true,
      db: 0,
      keyPrefix: 'NS_'
    })
    client = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      showFriendlyErrorStack: true,
      db: 0,
      keyPrefix: 'NS_'
    })
  }
  return client
}

const addUser = async ({
                         username,
                         email,
                         hashedPassword,
                         name,
                         role,
                         company,
                         description
                       }) => {
  try {
    const id = cuid()
    const client = await getClient()
    await client.hset(['AUTH:USERNAME', username, `${hashedPassword}:${id}:1`])
    await client.hset(['AUTH:EMAIL', email, `${hashedPassword}:${id}:1`])
    await client.hset(['USERS', id, JSON.stringify({
      id,
      username,
      hashedPassword,
      name,
      role,
      company,
      description,
      status: 1
    })])
    return {
      id,
      email,
      username,
      name,
      role,
      company,
      description,
      status: 1
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
    const client = await getClient()
    let user = await client.hget(['USERS', id])
    if (user) {
      user = JSON.parse(user)
      user.status = 0
      const {username, email, hashedPassword} = user
      await client.hset(['AUTH:USERNAME', username, `${hashedPassword}:${id}:0`])
      await client.hset(['AUTH:EMAIL', email, `${hashedPassword}:${id}:0`])
      await client.hset(['USERS', id, JSON.stringify(user)])
      return user
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

const getUserById = async ({
                             id
                           }) => {
  try {
    const client = await getClient()
    const user = await client.hget(['USERS', id])
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
    const client = await getClient()
    let user = await client.hget(['USERS', id])
    if (user) {
      user = JSON.parse(user)
      user.name = name || user.name
      user.role = role || user.role
      user.company = company || user.company
      user.description = description || user.description
      await client.hset(['USERS', id, JSON.stringify(user)])
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
    const client = await getClient()
    const rowUsers = await client.hvals(['USERS'])
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

const collectionHandlers = {
  '/addUser': addUser,
  '/deleteUserById': deleteUserById,
  '/updateUserById': updateUserById,
  '/getUserById': getUserById,
  '/getUsers': getUsers,
}

const isDisconnection = (error) => {
  const disconnected = error && (error.message === 'ResourceRequest timed out' ||
    error.toString().includes('ResourceRequest timed out') || error.toString().includes('EHOSTUNREACH'))
  console.log('ns-error', disconnected)
  return disconnected
}

const resetRedisClient = async () => {
  console.log('resetRedisClient')
  client = undefined
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
