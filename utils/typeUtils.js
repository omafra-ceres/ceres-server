const isObject = val => val === Object(val) && !Array.isArray(val)

// Flattens any nested objects to a shallow object
// Input:  { name: 'example', nested: { one: '1', two: '2' } }
// Output: { name: 'example', nested.one': '1', nested.two': '2' }
const flattenObject = (object, prefix) => (
  Object.keys(object).reduce((acc, key) => {
    const value = object[key]
    const name = prefix ? `${prefix}.${key}` : key
    if (isObject(value)) {
      const flat = flattenObject(value, name)
      Object.keys(flat).forEach(flatKey => {
        acc[flatKey] = flat[flatKey]
      })
    } else {
      acc[name] = value
    }
    return acc
  }, {})
)

module.exports = {
  isObject,
  flattenObject
}