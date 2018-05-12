const LabelSet = require('../lib/label_set')

describe('label sets', function () {
  function byName (a, b) {
    if (a.name > b.name) {
      return 1
    }
    if (a.name < b.name) {
      return -1
    }
    return 0
  }

  test('a simple set', () => {
    const options = {
      namespace: 'alphabet',
      defaultColor: 'cccccc',
      key: 'fruit',
      prefix: 'letters',
      values: [
        {name: 'a', fruit: 'apple'},
        {name: 'b', fruit: 'banana'}
      ]
    }

    let set = new LabelSet(options)
    expect(set.labels().sort(byName)).toEqual(['alphabet/letters/a', 'alphabet/letters/b'])

    let label = set.label({fruit: 'apple'})
    expect(label).toEqual('alphabet/letters/a')

    label = set.find({fruit: 'banana'})
    expect(label.name).toEqual('alphabet/letters/b')
    expect(label.color).toEqual('cccccc')

    expect(set.prefix).toEqual('alphabet/letters')
  })

  test('set keeps values beyond color, name, and lookup key', () => {
    const options = {
      namespace: 'namespace',
      prefix: 'prefix',
      key: 'lookup',
      values: [
        {name: 'apple', lookup: 'a', garbage: 'nonsense'},
        {name: 'banana', lookup: 'b', garbage: 'whatever'}
      ]
    }

    let set = new LabelSet(options)
    let a = set.find({lookup: 'a'})
    let b = set.find({lookup: 'b'})
    expect(a.garbage).toEqual('nonsense')
    expect(b.garbage).toEqual('whatever')
  })

  test('set with numeric lookup', () => {
    const options = {
      namespace: 'a',
      prefix: 'b',
      defaultColor: 'cccccc',
      key: 'stars',
      values: [
        {name: 'sucks', stars: 0},
        {name: 'rocks', stars: 1}
      ]
    }

    let set = new LabelSet(options)

    expect(set.labels().sort(byName)).toEqual(['a/b/sucks', 'a/b/rocks'])

    let label = set.find({stars: 0})
    expect(label.name).toEqual('a/b/sucks')
    expect(label.color).toEqual('cccccc')
  })

  test('venn diagram', () => {
    let set = new LabelSet({
      namespace: 'L',
      key: 'level',
      prefix: 'levels',
      values: [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'},
        {name: 'd'}
      ]
    })

    let labels = set.intersection(['a', 'L/levels/b', 'c', 'L/levels/d'])
    expect(labels).toEqual(['L/levels/b', 'L/levels/d'])

    labels = set.missing(['a', 'L/levels/b', 'c', 'L/levels/d'])
    expect(labels).toEqual(['L/levels/a', 'L/levels/c'])
  })
})
