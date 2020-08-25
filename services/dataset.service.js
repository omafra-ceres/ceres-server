const { datasetDb } = require("../db")
const templateService = require('./template.service')

const datasetService = {
  list: async (deleted=false) => {
    const datasets = await datasetDb.list(deleted)
    return datasets.map(set => ({
      id: set._id.valueOf(),
      ...set.details,
      ...deleted && { deleted_on: set.deleted_on }
    }))
  },
  create: async (details, templateId) => {
    const created = await datasetDb.create(details, templateId)
    return created._id
  },
  get: async (datasetId) => {
    const getDataset = datasetDb.findOne(datasetId)
    const getItems = datasetDb.getData(datasetId)
    const checkDeleted = datasetDb.hasDeleted(datasetId)
    
    const [{template_id, details}, items, hasDeleted] = await Promise.all([
      getDataset,
      getItems,
      checkDeleted
    ]).catch(console.error)

    const template = await templateService.findOne(template_id)

    return { details, template, items, hasDeleted }
  },
  addItem: async (datasetId, dataValues) => {
    const item = datasetDb.addItem(datasetId, dataValues)
    return item
  },
  deleteItems: async (ids) => {
    datasetDb.deleteItems(ids)
  },
  getDeleted: async (datasetId) => {
    return datasetDb.getData(datasetId, true, "deleted_on")
  },
  updateDetails: datasetDb.updateDetails
}

module.exports = datasetService