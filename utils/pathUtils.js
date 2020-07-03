const nameToPath = name => (
  name && name.toLowerCase()
    .replace(/[^a-z\d-_ ]/g, "")
    .trim()
    .replace(/[\s-_]+/g, "-")
)

module.exports = nameToPath