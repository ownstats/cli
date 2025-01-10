ownstats
=================

CLI for managing a https://ownstats.com instance

[![Version](https://img.shields.io/npm/v/ownstats.svg)](https://npmjs.org/package/ownstats)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ownstats
$ ownstats COMMAND
running command...
$ ownstats (--version)
ownstats/0.1.0 darwin-arm64 node-v22.12.0
$ ownstats --help [COMMAND]
USAGE
  $ ownstats COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ownstats config ACTION PROPERTY [VALUE]`](#ownstats-config-action-property-value)
* [`ownstats help [COMMAND]`](#ownstats-help-command)
* [`ownstats installation ACTION`](#ownstats-installation-action)
* [`ownstats stack ACTION NAME`](#ownstats-stack-action-name)
* [`ownstats user ACTION`](#ownstats-user-action)
* [`ownstats verify`](#ownstats-verify)

## `ownstats config ACTION PROPERTY [VALUE]`

Configure the project settings

```
USAGE
  $ ownstats config ACTION PROPERTY [VALUE] [-j]

ARGUMENTS
  ACTION    (get|set) The action to perform
  PROPERTY  (aws-stage|aws-region|aws-profile) The property to configure
  VALUE     The configuration value

FLAGS
  -j, --json  Show output as JSON

DESCRIPTION
  Configure the project settings
```

_See code: [src/commands/config/index.ts](https://github.com/ownstats/cli-v2/blob/v0.1.0/src/commands/config/index.ts)_

## `ownstats help [COMMAND]`

Display help for ownstats.

```
USAGE
  $ ownstats help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ownstats.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.20/src/commands/help.ts)_

## `ownstats installation ACTION`

Create a local Ownstats installation from the repository

```
USAGE
  $ ownstats installation ACTION -p <value> -n <value> [-d]

ARGUMENTS
  ACTION  (create) The installation action to perform

FLAGS
  -d, --createDir     Create directory if it doesn't exist
  -n, --name=<value>  (required) The name of the installation to create
  -p, --path=<value>  (required) An absolute path where a new OwnStats installation shall be created in

DESCRIPTION
  Create a local Ownstats installation from the repository
```

_See code: [src/commands/installation/index.ts](https://github.com/ownstats/cli-v2/blob/v0.1.0/src/commands/installation/index.ts)_

## `ownstats stack ACTION NAME`

Interact with OwnStats stacks within an installation

```
USAGE
  $ ownstats stack ACTION NAME

ARGUMENTS
  ACTION  (deploy|package|remove|sync|build|install) The action to perform
  NAME    (frontend|backend|client) The stack name

DESCRIPTION
  Interact with OwnStats stacks within an installation
```

_See code: [src/commands/stack/index.ts](https://github.com/ownstats/cli-v2/blob/v0.1.0/src/commands/stack/index.ts)_

## `ownstats user ACTION`

Manage OwnStats user

```
USAGE
  $ ownstats user ACTION

ARGUMENTS
  ACTION  (create|update-password) The action to perform

DESCRIPTION
  Manage OwnStats user
```

_See code: [src/commands/user/index.ts](https://github.com/ownstats/cli-v2/blob/v0.1.0/src/commands/user/index.ts)_

## `ownstats verify`

Verify AWS credentials

```
USAGE
  $ ownstats verify [-p <value>]

FLAGS
  -p, --profile=<value>  [default: default] AWS profile to use

DESCRIPTION
  Verify AWS credentials

EXAMPLES
  $ ownstats verify --profile default
  Verifying AWS credentials...
  Successfully authenticated with AWS using profile: default
```

_See code: [src/commands/verify/index.ts](https://github.com/ownstats/cli-v2/blob/v0.1.0/src/commands/verify/index.ts)_
<!-- commandsstop -->
