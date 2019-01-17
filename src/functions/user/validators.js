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

const schemaGetByUserId = joi.object().keys({
  userId: joi.string().required().trim()
}).options({stripUnknown: true})

const getByUserId = (input) => {
  return joi.validate(input, schemaGetByUserId)
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

const addProvider = (input) => {
  return joi.validate(input, schemaAddProvider)
}

const schemaAddProvider = joi.object().keys({
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

const schemaAddBirth = joi.object().keys({
  earTag: joi.string().required().trim(),
  birthDate: joi.string().required().trim(),
  breed: joi.string().required().trim(),
  gender: joi.string().optional().trim().allow('').default(''),
  skinColor: joi.string().optional().trim().allow('').default(''),
  birthWeight: joi.number().optional().default(0),
  birthName: joi.string().optional().trim().allow('').default(''),
  motherEarTag: joi.string().optional().trim().allow('').default(''),
  birthExploitation: joi.string().optional().trim().allow('').default(''),
  birthType1: joi.string().optional().trim().allow('').default(''),
  birthType2: joi.string().optional().trim().allow('').default(''),
  hasEmbryoTransfer: joi.boolean().optional().default(false),
  crotalDonorTag: joi.string().optional().trim().allow('').default('')
}).options({stripUnknown: true})

const addBirth = (input) => {
  return joi.validate(input, schemaAddBirth)
}

const schemaAddClient = joi.object().keys({
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

const schemaGetId = joi.object().keys({
  id: joi.string().required().trim()
}).options({stripUnknown: true})

const getId = (input) => {
  return joi.validate(input, schemaGetId)
}

const schemaAddPurchase = joi.object().keys({
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

const schemaAddProduct = joi.object().keys({
  name: joi.string().required().trim(),
  barcode: joi.string().required().trim(),
  sanitaryRegistration: joi.string().optional().trim().allow('').default(''),
  specialCares: joi.string().optional().trim().allow('').default(''),
  stock: joi.number().optional().default(0),
  description: joi.string().optional().trim().allow('').default(''),
  urlImages: joi.array().items(joi.object().keys(
    {
      priority: joi.number().optional().default(0),
      url: joi.string().optional().trim().allow('').default('')
    }
  )).optional().allow([]).default([]),
  urlVideo: joi.string().optional().trim().allow('').default(''),
  ingredients: joi.array().items(joi.object().keys(
    {
      name: joi.string().required().trim(),
      quantity: joi.number().optional().default(0),
      quantityUnit: joi.string().optional().trim().allow('').default('')
    }
  )).optional().allow([]).default([]),
  nutritionalValues: joi.array().items(joi.object().keys(
    {
      proportion: joi.number().optional().default(0),
      name: joi.string().required().trim(),
      quantity: joi.number().optional().default(0),
      percent: joi.number().optional().default(0)
    }
  )).optional().allow([]).default([]),
}).options({stripUnknown: true})

const addProduct = (input) => {
  return joi.validate(input, schemaAddProduct)
}

export {
  validateUser,
  getUserById,
  updateUserById,
  deleteUserById,
  login,
  addProvider,
  addPurchase,
  addClient,
  getByUserId,
  addProduct,
  addBirth,
  getId
}
