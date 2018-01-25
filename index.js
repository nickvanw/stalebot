module.exports = (robot) => {
  // New Issue or Pull Request is opened in the repo
  robot.on(['pull_request.opened', 'issues.opened'], async context => {
    // Apply the labels (waiting for maintainer, ...)
    robot.log(context)
  })

  // App is installed on a repo
  robot.on('installation_repositories.added', async context => {
    // Create the necessary labels
    robot.log(context)
  })
}
