const createScheduler = require('probot-scheduler');

module.exports = (robot) => {
  scheduler = createScheduler(robot);

  robot.on('schedule.repository', context => {
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
