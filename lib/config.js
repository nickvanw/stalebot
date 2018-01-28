const LabelSet = require('./label_set')

module.exports = class Config {
  constructor (options) {
    options = options || {}

    options.namespace = options.namespace || 'stalebot'
    options.defaultColor = options.defaultColor || 'cccccc'

    options.roles = options.roles || {}
    options.roles.author = options.roles.author || {}
    options.roles.maintainer = options.roles.maintainer || {}

    let attributes = {
      namespace: options.namespace,
      defaultColor: options.defaultColor,
      key: 'role',
      prefix: options.roles.prefix || 'waiting-for',
      values: [
        {
          role: 'author',
          name: options.roles.author.name || 'author',
          color: options.roles.author.color || options.defaultColor
        },
        {
          role: 'maintainer',
          name: options.roles.maintainer.name || 'maintainer',
          color: options.roles.maintainer.color || options.defaultColor
        }
      ]
    }
    this.roles = new LabelSet(attributes)

    const dayInSeconds = 24 * 60 * 60
    const defaultEscalationLevels = [
      {color: '5dcc77', threshold: 0 * dayInSeconds, name: 'fresh'},
      {color: 'f9dc5c', threshold: 1 * dayInSeconds, name: 'needs-attention'},
      {color: 'ff8552', threshold: 15 * dayInSeconds, name: 'stale'},
      {color: 'da344d', threshold: 90 * dayInSeconds, name: 'dire'}
    ]

    options.escalation = options.escalation || {}
    options.escalation.levels = options.escalation.levels || defaultEscalationLevels

    for (let i = 0; i < options.escalation.levels.length; i++) {
      let value = options.escalation.levels[i]
      // add a lookup value
      value.level = i

      // make sure we have a threshold
      if (value.threshold === undefined) {
        value.threshold = (i << i) * dayInSeconds
      }
    }

    attributes = {
      namespace: options.namespace,
      defaultColor: options.defaultColor,
      key: 'level',
      prefix: options.escalation.prefix || 'status',
      values: options.escalation.levels
    }
    this.escalation = new LabelSet(attributes)
  }
}
