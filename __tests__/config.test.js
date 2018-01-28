const Config = require('../lib/config')

describe('config', function () {
  const defaultConfig = new Config()

  test('roles label text', () => {
    let options, config, author, expected

    // defaults
    expected = [
      'stalebot/waiting-for/author',
      'stalebot/waiting-for/maintainer'
    ]
    expect(defaultConfig.roles.labels().sort()).toEqual(expected)

    // override namespace
    options = {namespace: 'override'}
    config = new Config(options)
    expected = [
      'override/waiting-for/author',
      'override/waiting-for/maintainer'
    ]
    expect(config.roles.labels().sort()).toEqual(expected)

    // override prefix for label set
    options = {
      roles: {
        prefix: 'override'
      }
    }
    config = new Config(options)
    expected = [
      'stalebot/override/author',
      'stalebot/override/maintainer'
    ]
    expect(config.roles.labels().sort()).toEqual(expected)

    // override individual label value
    options = {
      roles: {
        author: {name: 'original-poster'}
      }
    }
    config = new Config(options)
    author = config.roles.find({role: 'author'})
    expect(author.name).toEqual('stalebot/waiting-for/original-poster')
  })

  test('roles label color', () => {
    let options, config, author, maintainer

    // defaults to default label color
    author = defaultConfig.roles.find({role: 'author'})
    maintainer = defaultConfig.roles.find({role: 'maintainer'})
    expect(author.color).toEqual('cccccc')
    expect(maintainer.color).toEqual('cccccc')

    // defaults to overridden default label color
    options = {
      defaultColor: 'ffffff'
    }
    config = new Config(options)
    author = config.roles.find({role: 'author'})
    maintainer = config.roles.find({role: 'maintainer'})
    expect(author.color).toEqual('ffffff')
    expect(maintainer.color).toEqual('ffffff')

    // can override individual label color
    options = {
      roles: {
        maintainer: {color: '000000'}
      }
    }
    config = new Config(options)
    maintainer = config.roles.find({role: 'maintainer'})
    expect(maintainer.color).toEqual('000000')
  })

  test('escalation label values', () => {
    let options, config, expected

    expected = [
      'stalebot/status/dire',
      'stalebot/status/fresh',
      'stalebot/status/needs-attention',
      'stalebot/status/stale'
    ]
    expect(defaultConfig.escalation.labels().sort()).toEqual(expected)

    // override namespace
    options = {namespace: 'override'}
    config = new Config(options)
    expected = [
      'override/status/dire',
      'override/status/fresh',
      'override/status/needs-attention',
      'override/status/stale'
    ]
    expect(config.escalation.labels().sort()).toEqual(expected)

    // override prefix for label set
    options = {
      escalation: {
        prefix: 'override'
      }
    }
    config = new Config(options)
    expected = [
      'stalebot/override/dire',
      'stalebot/override/fresh',
      'stalebot/override/needs-attention',
      'stalebot/override/stale'
    ]
    expect(config.escalation.labels().sort()).toEqual(expected)

    // override entire label set
    options = {
      escalation: {
        levels: [
          {name: 'good'},
          {name: 'ok'},
          {name: 'bad'}
        ]
      }
    }
    config = new Config(options)
    expect(config.escalation.labels().length).toEqual(3)

    let good = config.escalation.find({level: 0})
    let ok = config.escalation.find({level: 1})
    let bad = config.escalation.find({level: 2})
    expect(good.name).toEqual('stalebot/status/good')
    expect(ok.name).toEqual('stalebot/status/ok')
    expect(bad.name).toEqual('stalebot/status/bad')
  })

  test('escalation label color', () => {
    let options, config, label

    // defaults to default labels with default label color
    label = defaultConfig.escalation.find({level: 0})
    expect(label.color).toEqual('5dcc77')

    // when overriding label set, defaults to defined defaultColor
    options = {
      defaultColor: 'ffffff',
      escalation: {
        levels: [
          {name: 'fresh'},
          {name: 'needs-attention'},
          {name: 'stale'},
          {name: 'dire'}
        ]
      }
    }
    config = new Config(options)
    config.escalation.values.forEach(value => {
      expect(value.color).toEqual('ffffff')
    })

    // can set color when overriding
    options = {
      escalation: {
        levels: [
          {name: 'good', color: 'ffffff'},
          {name: 'ok', color: '999999'},
          {name: 'bad', color: '333333'}
        ]
      }
    }
    config = new Config(options)
    let good = config.escalation.find({level: 0})
    let ok = config.escalation.find({level: 1})
    let bad = config.escalation.find({level: 2})
    expect(good.color).toEqual('ffffff')
    expect(ok.color).toEqual('999999')
    expect(bad.color).toEqual('333333')
  })

  test('escalation thresholds', () => {
    // has default thresholds
    defaultConfig.escalation.values.forEach(value => {
      expect(value.threshold).toBeDefined()
    })

    // If someone overrides levels without setting thresholds
    // then we need to define something.
    // For now I'm making it grow exponentially.
    let options = {
      escalation: {
        levels: [
          {name: 'great'},
          {name: 'good'},
          {name: 'cool'},
          {name: 'meh'},
          {name: 'hmm'},
          {name: 'blech'},
          {name: 'cmon'},
          {name: 'freal'},
          {name: 'goddammit'},
          {name: 'wtf'}
        ]
      }
    }
    let config = new Config(options)

    for (let i = 0; i < config.escalation.values.length; i++) {
      expect(config.escalation.values[i].threshold).toBeDefined()
    }
  })
})
