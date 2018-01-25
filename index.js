module.exports = (robot) => {
  robot.on(['pull_request.opened', 'issues.opened'], async context => {
    const params = labelParams(context, { labels: ["stalebot/waiting-for/maintainer"] })
    const result = await context.github.issues.addLabels(params)
    robot.log(result)
    return result
  })

  robot.on(['issue_comment.created', 'commit_comment.created', 'pull_request_review.submitted', 'pull_request_review_comment.created'], async context => {
    if (await is_maintainer(context)){
      await context.github.issues.addLabels(labelParams(context, {labels: ["stalebot/waiting-for/author"]}))
      await context.github.issues.removeLabel(labelParams(context, {name: "stalebot/waiting-for/maintainer"}))
    }
  })

  async function is_maintainer(context) {
    robot.log(context)
    owner = context.payload.repository.owner.login
    username = username(context)
    repo = repoName(context)
    const result = await context.github.repos.reviewUserPermissionLevel({owner, repo, username})

    permission = result.data.permission
    return permission == "admin" || permission == "write"
  }

  function labelParams(context, label_names) {
    params = {
      owner: context.payload.repository.owner.login,
      repo: repoName(context),
      number: issueOrPRNumber(context),
    }
    return Object.assign(params, label_names)
  }

  function username(context) {
    if (context["payload"]["issue"]) {
      return context["payload"]["issue"]["user"]["login"]
    } else {
      return context["payload"]["review"]["user"]["login"]
    }
  }

  function repoName(context) {
    if (context["payload"]["repository"]) {
      return context["payload"]["repository"]["name"]
    } else {
      return context["payload"]["repo"]["name"]
    }
  }

  function issueOrPRNumber(context) {
    if (context["payload"]["issue"]) {
      return context["payload"]["issue"]["number"]
    } else {
      return context["payload"]["pull_request"]["number"]
    }
  }
}
