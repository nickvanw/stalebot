const moment = require('moment')
const Escalator = require('../lib/escalator')
const Config = require('../lib/config')

describe('escalator', function () {
  const escalator = new Escalator(new Config())

  test('recent issue', () => {
    let issue = fakeIssue({at: moment().subtract(1, 'second'), labels: []})
    let target = escalator.escalate(issue)
    expect(target.label).toEqual('stalebot/status/fresh')
  })

  test('day-old issue', () => {
    let issue = fakeIssue({at: moment().subtract(1, 'days').subtract(1, 'second'), labels: []})
    let target = escalator.escalate(issue)
    expect(target.label).toEqual('stalebot/status/needs-attention')
  })

  test('two-week old issue', () => {
    let issue = fakeIssue({at: moment().subtract(15, 'days').subtract(1, 'second'), labels: []})
    let target = escalator.escalate(issue)
    expect(target.label).toEqual('stalebot/status/stale')
  })

  test('ridiculously old issue', () => {
    let issue = fakeIssue({at: moment().subtract(90, 'days').subtract(1, 'second'), labels: []})
    let target = escalator.escalate(issue)
    expect(target.label).toEqual('stalebot/status/dire')
  })

  test('issue with recent author comment', () => {
    let issue = fakeIssue({at: moment().subtract(100, 'days'), labels: []})
    let comment = fakeComment({at: moment().subtract(1, 'second')})
    let target = escalator.escalate(issue, comment)
    expect(target.label).toEqual('stalebot/status/fresh')
  })

  test('issue with correct label', () => {
    let options = {
      at: moment().subtract(1, 'days').subtract(1, 'second'),
      labels: ['stalebot/status/needs-attention']
    }
    let issue = fakeIssue(options)
    let expected = {
      label: 'stalebot/status/needs-attention',
      add: [],
      remove: []
    }
    expect(escalator.escalate(issue)).toEqual(expected)
  })

  test('issue with no label', () => {
    let options = {
      at: moment().subtract(1, 'days').subtract(1, 'second'),
      labels: []
    }
    let issue = fakeIssue(options)
    let expected = {
      label: 'stalebot/status/needs-attention',
      add: ['stalebot/status/needs-attention'],
      remove: []
    }
    expect(escalator.escalate(issue)).toEqual(expected)
  })

  test('issue with irrelevant labels', () => {
    let options = {
      at: moment().subtract(1, 'days').subtract(1, 'second'),
      labels: ['bug', 'super-duper-important', 'stalebot/waiting-for/maintainer']
    }
    let issue = fakeIssue(options)
    let expected = {
      label: 'stalebot/status/needs-attention',
      add: ['stalebot/status/needs-attention'],
      remove: []
    }
    expect(escalator.escalate(issue)).toEqual(expected)
  })

  test('issue with wrong label', () => {
    let options = {
      at: moment().subtract(1, 'days').subtract(1, 'second'),
      labels: ['stalebot/status/fresh']
    }
    let issue = fakeIssue(options)
    let expected = {
      label: 'stalebot/status/needs-attention',
      add: ['stalebot/status/needs-attention'],
      remove: ['stalebot/status/fresh']
    }
    expect(escalator.escalate(issue)).toEqual(expected)
  })

  test('issue with several wrong labels', () => {
    let options = {
      at: moment().subtract(1, 'days').subtract(1, 'second'),
      labels: [
        'stalebot/status/fresh',
        'stalebot/status/needs-attention', // keep this one
        'stalebot/status/stale',
        'stalebot/status/dire'
      ]
    }
    let issue = fakeIssue(options)
    let expected = {
      label: 'stalebot/status/needs-attention',
      add: [],
      remove: ['stalebot/status/fresh', 'stalebot/status/stale', 'stalebot/status/dire']
    }
    expect(escalator.escalate(issue)).toEqual(expected)
  })

  function fakeIssue (options) {
    options.labels = options.labels || []

    let issue = {created_at: options.at.toISOString(), labels: []}

    for (let i = 0; i < options.labels.length; i++) {
      issue.labels.push({id: i + 10, name: options.labels[i], color: 'cccccc'})
    }
    return issue
  }

  function fakeComment (options) {
    return {
      created_at: options.at.toISOString()
    }
  }
})
