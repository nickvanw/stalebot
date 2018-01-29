const createScheduler = require('probot-scheduler')
<<<<<<< HEAD
const Config = require('./lib/config')
const Escalator = require('./lib/escalator')

module.exports = (robot) => {
  const config = new Config()
  const escalator = new Escalator(config)
=======
const moment = require('moment')
const Config = require('./lib/config')

module.exports = (robot) => {
  const config = new Config()
>>>>>>> Pull the new config into the app logic

  createScheduler(robot)

  robot.on('schedule.repository', async context => {
    context.log(context.repo(), 'Running scheduled job to check issues for escalation.')

    const issues = context.github.issues.getForRepo(context.repo({
      state: 'open',
<<<<<<< HEAD
      labels: config.roles.label({role: 'maintainer'}),
=======
      label: config.roles.label({role: 'maintainer'}),
>>>>>>> Pull the new config into the app logic
      per_page: 100
    }))

    await context.github.paginate(issues, async res => {
      res.data.forEach(async issue => {
        context.log({issue: issue.html_url}, 'Checking issue for escalation.')

        let lastAuthorComment

        const comments = await context.github.issues.getComments(
          context.repo({
            number: issue.number,
            per_page: 100
          })
        )

        await context.github.paginate(comments, async (res, stop) => {
          res.data.forEach(comment => {
            if (comment.user.id === issue.user.id) {
              lastAuthorComment = comment
              stop()
            }
          })
        })

        let escalation = escalator.escalate(issue, lastAuthorComment)

        escalation.remove.forEach(async label => {
          await context.github.issues.removeLabel(context.repo({
            number: issue.number,
            name: label
          }))
        })

        if (escalation.add.length > 0) {
          await context.github.issues.addLabels(context.repo({
            number: issue.number,
            labels: escalation.add
          }))
        }
      })
    })
  })

  // App is installed on an org or user account
  robot.on('installation.created', async context => {
    await createLabels(context, context.payload.repositories)
  })

  // App is installed on additional repositories in an org
  robot.on('installation_repositories.added', async context => {
    await createLabels(context, context.payload.repositories_added)
  })

  // New issue or PR is opened
  robot.on(['pull_request.opened', 'issues.opened'], async context => {
    const params = context.issue({ labels: [config.roles.label({role: 'maintainer'})] })
    const result = await context.github.issues.addLabels(params)
    return result
  })

  // Maintainer comments/reviews
  robot.on(['issue_comment.created', 'pull_request_review.submitted', 'pull_request_review_comment.created'], async context => {
    const config = new Config()

    if (await isMaintainer(context)) {
      await context.github.issues.removeLabel(context.issue({name: config.roles.label({role: 'maintainer'})}))
      await context.github.issues.addLabels(context.issue({labels: [config.roles.label({role: 'author'})]}))
    }
  })

  // New comments from participants
  robot.on(['issue_comment.created', 'pull_request_review.submitted', 'pull_request_review_comment.created'], async context => {
    const config = new Config()

    // Do not consider authors as maintainers in the context of their own PRs/issues.
    if (isAuthor(context)) {
      await context.github.issues.removeLabel(context.issue({name: config.roles.label({role: 'author'})}))
      await context.github.issues.addLabels(context.issue({labels: [config.roles.label({role: 'maintainer'})]}))
    } else if (await isMaintainer(context)) {
      await context.github.issues.addLabels(context.issue({labels: [config.roles.label({role: 'author'})]}))
      await context.github.issues.removeLabel(context.issue({name: config.roles.label({role: 'maintainer'})}))
    }
  })
}

// Check if commenter is a maintainer
async function isMaintainer (context) {
  const username = commenterUsername(context)
  const result = await context.github.repos.reviewUserPermissionLevel(context.repo({username}))

  const permission = result.data.permission
  return permission === 'admin' || permission === 'write'
}

// Check if commenter is the original author
function isAuthor (context) {
  let issueAuthor

  if (context.payload.issue) {
    issueAuthor = context.payload.issue.user.login
  } else if (context.payload.pull_request) {
    issueAuthor = context.payload.pull_request.user.login
  } else if (context.payload.review) {
    issueAuthor = context.payload.review.user.login
  }

  return issueAuthor === context.payload.sender.login
}

function commenterUsername (context) {
  if (context.payload.comment) {
    return context.payload.comment.user.login
  } else if (context.payload.issue) {
    return context.payload.issue.user.login
  } else {
    return context.payload.review.user.login
  }
}

// Create labels in new repo
async function createLabels (context, repos) {
  const config = new Config()
  const appLabels = config.roles.values.concat(config.escalation.values)

  repos.forEach(async repo => {
    const getLabels = context.github.issues.getLabels({
      owner: repo.full_name.split('/')[0],
      repo: repo.name,
      per_page: 100
    })

    let repoLabels = []
    await context.github.paginate(getLabels, async res => {
      res.data.forEach(label => {
        repoLabels.push(label.name)
      })
    })

    let labels = appLabels.filter(label => {
      return !repoLabels.includes(label.name)
    })

    labels.forEach(label => {
      context.github.issues.createLabel({
        owner: context.payload.installation.account.login,
        repo: repo.name,
        name: label.name,
        color: label.color
      })
    })
  })
}
