module.exports = class LabelSet {
  constructor (options) {
    options = options || {}

    this.prefix = [
      options.namespace || 'stalebot',
      options.prefix
    ].join('/')

    this.values = []
    options.values.forEach(value => {
      let label = {
        name: [this.prefix, value.name].join('/'),
        color: value.color || options.defaultColor || 'cccccc'
      }
      if (value[options.key] === undefined) {
        label[options.key] = value.name
      } else {
        label[options.key] = value[options.key]
      }
      Object.assign(value, label)

      this.values.push(value)
    })
  }

  label (options) {
    let target = this.find(options)
    if (target !== undefined) {
      return target.name
    }
  }

  find (options) {
    if (options === undefined || options.length === 0) {
      throw new Error('cannot find label without a lookup value')
    }

    let key = Object.keys(options)[0]
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i][key] === options[key]) {
        return this.values[i]
      }
    }
  }

  intersection (labels) {
    return this.labels().filter(label => {
      return labels.includes(label)
    })
  }

  missing (labels) {
    return this.labels().filter(label => {
      return !labels.includes(label)
    })
  }

  labels () {
    return this.values.map(this.name)
  }

  name (value) {
    return value.name
  }
}
