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

const schemaLogin = joi.object().keys({
  email: joi.string().required().trim().lowercase().email(),
  password: joi.string().required().trim()
}).options({stripUnknown: true})

const login = (input) => {
  return joi.validate(input, schemaLogin)
}

const schemaAddProvider = joi.object().keys({
  clientId: joi.string().required().trim(),
  name: joi.string().required().trim(),
  code: joi.string().required().trim(),
  address: joi.string().required().trim(),
  postalCode: joi.string().required().trim(),
  city: joi.string().required().trim(),
  country: joi.string().required().trim(),
  commercialContactName: joi.string().optional().trim().allow('').default(''),
  commercialContactRol: joi.string().optional().trim().allow('').default(''),
  commercialContactEmail: joi.string().optional().trim().allow('').default(''),
  commercialContactPhone: joi.string().optional().trim().allow('').default(''),
  emergencyContactName: joi.string().optional().trim().allow('').default(''),
  emergencyContactRol: joi.string().optional().trim().allow('').default(''),
  emergencyContactEmail: joi.string().optional().trim().allow('').default(''),
  emergencyContactPhone: joi.string().optional().trim().allow('').default(''),
  certificates: joi.array().items(joi.object().keys(
    {
      name: joi.string().optional().trim().allow('').default(''),
      number: joi.string().optional().trim().allow('').default('')
    }
  )).optional().allow([]).default([])
}).options({stripUnknown: true})

const addProvider = (input) => {
  return joi.validate(input, schemaAddProvider)
}

const schemaAddClient = joi.object().keys({
  clientId: joi.string().required().trim(),
  name: joi.string().required().trim(),
  code: joi.string().required().trim(),
  address: joi.string().required().trim(),
  postalCode: joi.string().required().trim(),
  city: joi.string().required().trim(),
  country: joi.string().required().trim(),
  commercialContactName: joi.string().optional().trim().allow('').default(''),
  commercialContactRol: joi.string().optional().trim().allow('').default(''),
  commercialContactEmail: joi.string().optional().trim().allow('').default(''),
  commercialContactPhone: joi.string().optional().trim().allow('').default(''),
  emergencyContactName: joi.string().optional().trim().allow('').default(''),
  emergencyContactRol: joi.string().optional().trim().allow('').default(''),
  emergencyContactEmail: joi.string().optional().trim().allow('').default(''),
  emergencyContactPhone: joi.string().optional().trim().allow('').default(''),
  certificates: joi.array().items(joi.object().keys(
    {
      name: joi.string().optional().trim().allow('').default(''),
      number: joi.string().optional().trim().allow('').default('')
    }
  )).optional().allow([]).default([])
}).options({stripUnknown: true})

const addClient = (input) => {
  return joi.validate(input, schemaAddClient)
}

const schemaAddPurchase = joi.object().keys({
  clientId: joi.string().required().trim(),
  providerName: joi.string().required().trim(),
  documentDate: joi.string().required().trim(),
  documentType: joi.string().required().trim(),
  documentNumber: joi.string().required().trim(),
  products: joi.array().items(joi.object().keys(
    {
      name: joi.string().optional().trim().allow('').default(''),
      expirationDate: joi.string().optional().trim().allow('').default(''),
      barcode: joi.string().optional().trim().allow('').default(''),
      quantity: joi.number().optional().default(0),
      price: joi.number().optional().default(0)
    }
  )).optional().allow([]).default([])
}).options({stripUnknown: true})

const addPurchase = (input) => {
  return joi.validate(input, schemaAddPurchase)
}

export {
  validateUser,
  getUserById,
  updateUserById,
  deleteUserById,
  login,
  addProvider,
  addPurchase
}
