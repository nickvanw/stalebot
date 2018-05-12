# stalebot

> a GitHub App built with [probot](https://github.com/probot/probot) that keeps track of issues and pull requests that need a maintainer's attention.

## Problem

There's some research out of Mozilla that suggests that if a first-time contributor gets a response within 24 (?) hours, they're much more likely to make a second contribution. This means that you want maintainers to pay attention (notifications!) so that they can respond.

I have lots of repos in my project. Some are actively maintained, in which case I don't have to pay attention to them at all, unless I'm @-mentioned. Some are sporadically maintained. These are kind of annoying, because they generate a lot of noise a.k.a. notifications that most of the time I don't need to pay attention to, but sometimes I do, but then because of all the notifications, I end up not getting to the ones I do need to pay attention to early enough. And then there are the repos that I do need to pay attention to.

All of this creates a huge amount of noise. There have been Saturday mornings where I have spent hours reading through hundreds of notifications. Half of them were for things that were already closed or merged. Another significant chunk of them were being handled by people who were better positioned for it anyway. At the end of it only a few dozen notifications actually needed my attention or involvement. The read/realize it's taken care of, archive cycle is pretty quick when there's just one notification. But it adds up.

What I want to see is a list of everything in my project that hasn't been dealt with by the maintainers in the first N hours. If it's closed before I get to it, I shouldn't have know about it. If it's in someone else's capable hands, then I have better things to think about.

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
