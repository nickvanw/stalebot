const moment = require('moment')

module.exports = class Escalator {
  constructor (config) {
    this.config = config
  }

  escalate (issue, comment) {
    this.config.escalation.values.sort(this.descByThreshold)

    let lastActivityAt = moment(issue.created_at)
    if (comment !== undefined) {
      lastActivityAt = moment(comment.created_at)
    }

    const age = moment() - lastActivityAt

    let value = this.config.escalation.values.find(value => {
      if (age > value.threshold * 1000) {
        return value
      }
    })

    let labels = issue.labels.filter(label => {
      return label.name.startsWith(this.config.escalation.prefix)
    }).map(label => {
      return label.name
    })

    let add = []
    if (!labels.includes(value.name)) {
      add.push(value.name)
    }

    let remove = labels.filter(label => {
      return label !== value.name
    })

    return {label: value.name, add: add, remove: remove}
  }

  descByThreshold (a, b) {
    if (a.threshold > b.threshold) {
      return -1
    }
    if (a.threshold < b.threshold) {
      return 1
    }
    return 0
  }
}
