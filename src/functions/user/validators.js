import * as joi from 'joi'

const schemaUser = joi.object().keys({
  username: joi.string().required().trim().lowercase(),
  email: joi.string().required().trim().lowercase().email(),
  password: joi.string().required().trim().min(parseInt(process.env.PASSWORD_LENGTH)),
  name: joi.string().required().trim(),
  role: joi.string().optional().trim().default('').allow(''),
  company: joi.string().optional().trim().default('').allow(''),
  description: joi.string().optional().trim().default('').allow('')
}).options({stripUnknown: true})

const validateUser = (input) => {
  return joi.validate(input, schemaUser)
}

const schemaGetUserById = joi.object().keys({
  id: joi.string().required().trim()
}).options({stripUnknown: true})

const getUserById = (input) => {
  return joi.validate(input, schemaGetUserById)
}

const schemaUpdateUserById = joi.object().keys({
  id: joi.string().required().trim(),
  name: joi.string().optional().trim().default('').allow(''),
  role: joi.string().optional().trim().default('').allow(''),
  company: joi.string().optional().trim().default('').allow(''),
  description: joi.string().optional().trim().default('').allow('')
}).options({stripUnknown: true})

const updateUserById = (input) => {
  return joi.validate(input, schemaUpdateUserById)
}

const schemaDeleteUserById = joi.object().keys({
  id: joi.string().required().trim()
}).options({stripUnknown: true})

const deleteUserById = (input) => {
  return joi.validate(input, schemaDeleteUserById)
}

export {
  validateUser,
  getUserById,
  updateUserById,
  deleteUserById
}
