# Git tracker

Git tracker is a module with zero external dependencies (not even Deno's
standard library) that allow you to easily create a report with the activities
you have done on some of the known platforms to host projects: Gitlab and Github

## Requisites

- `userId`:
  - Gitlab `userId`
  - Github `username`

In both cases we will treat as `userId`

- `access token`
  - For Gitlab check:
    https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html
  - For Github check:
    https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

Remember to give the correct permission to the token for the module can consult
the activities

## Usage

This module could use as:

- shell command (create csv file)
- imported module (return csv string and optionally create file)

### Usage as shell command

```sh
> deno run --allow-net --allow-read --allow-write https://raw.githubusercontent.com/Jess182/git-tracker/main/mod.ts [OPTIONS]
```

#### OPTIONS

You can skip to pass all options when executing the command, the values not set
will be requested through the CLI

- `--platform` : Git platform, it could be `gitlab` or `github`
- `--userId` : Platform User ID
- `--accessToken` : User access token
- `--event` : User event
  - Gitlab:
    https://docs.gitlab.com/ee/user/profile/index.html#user-contribution-events
  - Github:
    https://docs.github.com/es/developers/webhooks-and-events/events/github-event-types
- `--startDate` : (Optional even in CLI prompt) Filter after this date (format
  "YYYY-MM-DD")
- `--endDate` : (Optional even in CLI prompt) Filter before this date (format
  "YYYY-MM-DD")
- `--fileName` : (Optional even in CLI prompt) File name
- `--skipPrompt` : [FLAG] Skip CLI prompt

### Usage as imported module

```ts
import {
	gitTracker,
	IOptions,
} from 'https://raw.githubusercontent.com/Jess182/git-tracker/main/mod.tss';

const options: IOptions = {
	platform: 'gitlab',
	userId: '<user ID>',
	accessToken: '<access token>',
	event: 'pushed',
	createFile: true,
};

const csv = await gitTracker(options);
```

#### Options

- `platform: string` : Git platform, it could be `gitlab` or `github`
- `userId: string` : Platform User ID
- `accessToken: string` : User access token
- `event: string` : User event
  - Gitlab:
    https://docs.gitlab.com/ee/user/profile/index.html#user-contribution-events
  - Github:
    https://docs.github.com/es/developers/webhooks-and-events/events/github-event-types
- `startDate?: string` : Filter after this date (format "YYYY-MM-DD")
- `endDate?: string` : Filter activities before this date (format "YYYY-MM-DD")
- `createFile? boolean`: Flag to create csv file
- `fileName? string`: File name

### Disclaimer

The information collected by the module (user ID | username, access token & the
information consulted) is not used or saved in any way.

I am not responsible for the use that is given to the code or module
