module.exports = (robot) => {
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
    // list of labels to create
    let labels = ["stalebot/waiting-for/maintainer", "stalebot/waiting-for/author"]
    // Create the necessary labels
    // todo(nick): This will fail for every label that already exists. Harmless
    await context.payload.repositories.forEach(repo => {
      labels.forEach(label => {
        context.github.issues.createLabel({
          owner: context.payload.installation.account.login,
          repo: repo.name,
          name: label,
          color: "cccccc"
        })
      })
    })
  })
}
