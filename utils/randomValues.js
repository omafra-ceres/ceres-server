const randomDate = () => new Date(Date.now() - (Math.floor(Math.random() * 86400000)))

const randomShortString = () => Math.random().toString(36).substring(2, 15)
const randomString = () => Array(Math.ceil(Math.random() * 6)).fill("").map(() => randomShortString()).join(" ")
const randomNumber = () => Math.ceil(Math.random() * 1000)
const randomBool = () => !!Math.round(Math.random())

const types = {
  string: randomString,
  number: randomNumber,
  boolean: randomBool
}

const randomType = () => {
  const typeList = Object.keys(types)
  const typeIndex = Math.floor(Math.random() * typeList.length)
  const type = typeList[typeIndex]
  return type
}

const randomValue = type => {
  const valType = type ? type : randomType()
  const value = types[valType]()
  return value
}

module.exports = {
  types,
  randomDate,
  randomType,
  randomValue,
  randomShortString
}