ownstats
=================

CLI for managing an OwnStats (https://ownstats.com) instance, providing a privacy-focused selfhosted web analytics solution on AWS.

[![Version](https://img.shields.io/npm/v/ownstats.svg)](https://npmjs.org/package/ownstats)

<!-- toc -->
* [Usage](#usage)
* [Guide](#guide)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ownstats
$ ownstats COMMAND
running command...
$ ownstats (--version)
ownstats/0.1.2 darwin-arm64 node-v22.12.0
$ ownstats --help [COMMAND]
USAGE
  $ ownstats COMMAND
...
```
<!-- usagestop -->

# Guide
## Creating a local OwnStats installation  
The first step is to create a local OwnStats installation. This can be done by running the following command:

```bash
ownstats installation create -d -p ~/ -n ownstats-installation
```

This will create a new directory called `ownstats-installation` in your home directory (assuming you're on a Unix-like operating system), and initialize a new OwnStats installation in it (see the [installation](#ownstats-installation-action) command). 

It will contain the current `main` branch of the [OwnStats repository](https://github.com/ownstats/ownstats).

## Configuring your OwnStats installation

You can now configure your OwnStats installation with the the [config](#ownstats-config-action-property-value) command. 

For example, you can set the AWS region you want to use (default: `us-east-1`):

```bash
ownstats config set aws-region eu-west-1
```

Or, you can set the AWS profile you want to use (default: `default`):

```bash
ownstats config set aws-profile my-profile
```

You can also set the stage you want to use (default: `prd`):

```bash
ownstats config set stage prd
```

## Deploying your OwnStats backend

You need to install the dependencies for the OwnStats backend first, before you can deploy it. This can be done by running the following command:

```bash
ownstats stack backend install
```

After that, you can deploy the OwnStats backend by running the following command:

```bash
ownstats stack backend deploy
```

Usually, this will take 5-10 minutes. See also the [stack](#ownstats-stack-action-name) command.

## Deploying your OwnStats frontend

You need to install the dependencies for the OwnStats frontend first, before you can deploy/sync it to your AWS account. This can be done by running the following command:

```bash
ownstats stack frontend install
```

Next, you need to build the frontend application. This can be done by running the following command:

```bash
ownstats stack frontend build
```

This will create an optimized bundle in the `frontend/dist` directory. After that, you can deploy/sync the OwnStats frontend by running the following command:

```bash
ownstats stack frontend sync
```

This will synchonize the frontend application in the `frontend/dist` directory to the frontend S3 bucket, which backs the frontend CloudFront distribution.

## Creating the OwnStats tracking client

Next, the OwnStats tracking client needs to be created. This is divided into multiple steps.

First, you need to install the dependencies for the OwnStats tracking client. This can be done by running the following command:

```bash
ownstats stack client install
```

After that, you need to build the tracking client. This can be done by running the following command:

```bash
ownstats stack client build
```

This will create an optimized bundle in the `client/dist` directory. After that, you can deploy/sync the OwnStats tracking client by running the following command:

```bash
ownstats stack client sync
```

It's automatically configured by the backend stack outputs (e.g. CloudFront URL for pushing the tracking data to). 

The client uses the [analytics](https://www.npmjs.com/package/analytics) library, which is a lightweight and easy-to-use library for tracking events. You could also customize the client to send the tracking data to additional destinations. Please refer to the [analytics](https://getanalytics.io/) documentation for more information.

## Creating a user for OwnStats

You need to create a user for OwnStats in your AWS account. This can be done by running the following command:

```bash
ownstats user create
```

You'll be asked to enter a **email address** and **password**. This will create a user in the Cognito user pool, which is used for logging in to the OwnStats frontend.

Please refer to the [user](#ownstats-user-action) command for more information regarding the password policy. This is the final step for the OwnStats deployment in your AWS account. 

## Accessing the OwnStats frontend

To access the OwnStats frontend, you can use the following command:

```bash
ownstats stack frontend open
```

This will show a link to your OwnStats frontend in your terminal. Click on it, and enter the username and password you created in the previous step. This will take you to the OwnStats frontend, where you can start tracking your data.

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

_See code: [src/commands/config/index.ts](https://github.com/ownstats/cli/blob/v0.1.2/src/commands/config/index.ts)_

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

_See code: [src/commands/installation/index.ts](https://github.com/ownstats/cli/blob/v0.1.2/src/commands/installation/index.ts)_

## `ownstats stack ACTION NAME`

Interact with OwnStats stacks within an installation

```
USAGE
  $ ownstats stack ACTION NAME

ARGUMENTS
  ACTION  (deploy|package|remove|sync|build|install|open) The action to perform
  NAME    (frontend|backend|client) The stack name

DESCRIPTION
  Interact with OwnStats stacks within an installation
```

_See code: [src/commands/stack/index.ts](https://github.com/ownstats/cli/blob/v0.1.2/src/commands/stack/index.ts)_

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

_See code: [src/commands/user/index.ts](https://github.com/ownstats/cli/blob/v0.1.2/src/commands/user/index.ts)_

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

_See code: [src/commands/verify/index.ts](https://github.com/ownstats/cli/blob/v0.1.2/src/commands/verify/index.ts)_
<!-- commandsstop -->
