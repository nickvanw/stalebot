module.exports = (robot) => {
  // New PR is opened
  robot.on(['pull_request.opened', 'issues.opened'], async context => {
    const params = labelParams(context, { labels: ["stalebot/waiting-for/maintainer"] })
    const result = await context.github.issues.addLabels(params)
    return result
  })

  // Maintainer comments/reviews
  robot.on(['issue_comment.created', 'pull_request_review.submitted', 'pull_request_review_comment.created'], async context => {
    if (await is_maintainer(context)){
      await context.github.issues.addLabels(labelParams(context, {labels: ["stalebot/waiting-for/author"]}))
      await context.github.issues.removeLabel(labelParams(context, {name: "stalebot/waiting-for/maintainer"}))
    }
  })

  // App is installed on a repo
  robot.on('installation.created', async context => {
    await createLabels(context, context.payload.repositories)
  })

  // App is installed on a specific repo?
  robot.on('installation_repositories.added', async context => {
    await createLabels(context, context.payload.repositories_added)
  })

  robot.on('pull_request_review_comment.created', async context => {
    let reviewAuthor = context.payload.comment.user.login
    let prAuthor = context.payload.pull_request.user.login
    if (reviewAuthor == prAuthor) {
      await authorCommented(
        context,
        context.payload.repository.owner.login,
        context.payload.repository.name,
        context.payload.pull_request.number,
      )
    }
  })

  robot.on('pull_request_review.submitted', async context => {
    let reviewAuthor = context.payload.review.user.login
    let prAuthor = context.payload.pull_request.user.login
    if (reviewAuthor == prAuthor) {
      await authorCommented(
        context,
        context.payload.repository.owner.login,
        context.payload.repository.name,
        context.payload.pull_request.number,
      )
    }
  })
  robot.on('issue_comment.created', async context => {
    let commentAuthor = context.payload.sender.login
    let issueAuthor = context.payload.comment.user.login
    if (commentAuthor == issueAuthor) {
      await authorCommented(
        context,
        context.payload.repository.owner.login,
        context.payload.repository.name,
        context.payload.issue.number,
      )
    }
  })
}

// Check if commenter is a maintainer
async function is_maintainer(context) {
  owner = context.payload.repository.owner.login
  username = username(context)
  repo = repoName(context)
  const result = await context.github.repos.reviewUserPermissionLevel({owner, repo, username})

  permission = result.data.permission
  return permission == "admin" || permission == "write"
}

// Create params for adding or removing a label
function labelParams(context, label_names) {
  params = {
    owner: context.payload.repository.owner.login,
    repo: repoName(context),
    number: issueOrPRNumber(context),
  }
  return Object.assign(params, label_names)
}

// Find username for issue or review
function username(context) {
  if (context.payload.issue) {
    return context.payload.issue.user.login
  } else {
    return context.payload.review.user.login
  }
}

// Find repo name for issue or review
function repoName(context) {
  if (context.payload.repository) {
    return context.payload.repository.name
  } else {
    return context.payload.repo.name
  }
}

// Find issue or PR number
function issueOrPRNumber(context) {
  if (context.payload.issue) {
    return context.payload.issue.number
  } else {
    return context.payload.pull_request.number
  }


async function authorCommented(context, owner, repo, number) {
  context.github.issues.removeLabel({
    owner: owner,
    repo: repo,
    number: number,
    name: "stalebot/waiting-for/author"
  })
  context.github.issues.addLabels({
    owner: owner,
    repo: repo,
    number: number,
    labels: ["stalebot/waiting-for/maintainer"]
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
