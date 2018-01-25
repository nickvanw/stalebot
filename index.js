const createScheduler = require('probot-scheduler');
const moment = require('moment')

module.exports = (robot) => {
  createScheduler(robot)

  robot.on('schedule.repository', async context => {
    context.log(context.repo(), 'Checking for issues that need excalation')

    const issues = context.github.issues.getForRepo(context.repo({
      state: 'open',
      label: 'stalebot/waiting-for/maintainer',
      per_page: 100
    }))

    await context.github.paginate(issues, async res => {
      res.data.forEach(async issue => {
        context.log({issue}, 'Checking issue for escalation')

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

        let currentLabel = issue.labels.find(label => label.name.startsWith('stalebot/status'))
        let newLabel

        const now = new Date()

        if (lastAuthorComment) {
          const lastCommentAt = moment(lastAuthorComment.create_at)
          const age = now - lastCommentAt / 1000 / 60 // FIXME: switch to days :)

          if (age >= 180) {
            newLabel = 'stalebot/status/dire'
          } else if (age >= 65) {
            newLabel = 'stalebot/status/needs-attention'
          } else if (age >= 5) {
            newLabel = 'stalebot/status/stale'
          } else {
            newLabel = 'stalebot/status/fresh'
          }

          if (currentLabel && currentLabel.name !== newLabel) {
            await context.github.issues.removeLabel(context.repo({
              number: issue.number,
              name: currentLabel.name
            }))
          } else if (currentLabel && newLabel === currentLabel.name) {
            return
          }

          await context.github.issues.addLabels(context.repo({
            number: issue.number,
            labels: [newLabel]
          }))
        }
      })
    })
  })

  robot.on(['pull_request.opened', 'issues.opened'], async context => {
    const params = newActionParams(context)
    const result = await context.github.issues.addLabels(params)
    robot.log(result)
    return result
  })

  function newActionParams(context) {

    params = {
      owner: context["payload"]["repository"]["owner"]["login"],
      repo: context["payload"]["repository"]["name"],
      number: issueOrPRNumber(context),
      labels: ["stalebot/waiting-for/maintainer"]
    }
    return params
  }

  function issueOrPRNumber(context) {
    if (context["payload"]["issue"]) {
      return context["payload"]["issue"]["number"]
    } else {
      return number = context["payload"]["pull_request"]["number"]
    }
  }

  // App is installed on a repo
  robot.on('installation.created', async context => {
    await createLabels(context, context.payload.repositories)
  })

  // App is installed on a specific repo?
  robot.on('installation_repositories.added', async context => {
    await createLabels(context, context.payload.repositories_added)
  })
}

let labels = ["stalebot/waiting-for/maintainer", "stalebot/waiting-for/author"]

// create labels in new repo
// todo(nick): does not check if labels exist.
async function createLabels(context, repos) {
  repos.forEach(repo => {
    labels.forEach(label => {
      context.github.issues.createLabel({
        owner: context.payload.installation.account.login,
        repo: repo.name,
        name: label,
        color: "cccccc"
      })
    })
  })
}
