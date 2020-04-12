auchand-check
=============

Little tool to check if an Auchan Drive have an available slot

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/auchand-check.svg)](https://npmjs.org/package/auchand-check)
[![Downloads/week](https://img.shields.io/npm/dw/auchand-check.svg)](https://npmjs.org/package/auchand-check)
[![License](https://img.shields.io/npm/l/auchand-check.svg)](https://github.com/v-six/auchand-check/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g auchand-check
$ auchand-check COMMAND
running command...
$ auchand-check (-v|--version|version)
auchand-check/0.1.0 darwin-x64 node-v13.12.0
$ auchand-check --help [COMMAND]
USAGE
  $ auchand-check COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`auchand-check help [COMMAND]`](#auchand-check-help-command)
* [`auchand-check slot`](#auchand-check-slot)

## `auchand-check help [COMMAND]`

display help for auchand-check

```
USAGE
  $ auchand-check help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `auchand-check slot`

search for the next available slot in an Auchan Drive store

```
USAGE
  $ auchand-check slot

OPTIONS
  -d, --dbFile=dbFile    [default: ./db/auchan-drive.db] Local database file
  -h, --help             show CLI help
  -n, --notify=notify    Slack channel to notify
  -p, --persist          Enable persistence
  -s, --storeId=storeId  [default: 870] Id of the store to check

EXAMPLE
  $ auchand-check slot -s 870 -p -n xxxxxxxxxxx
  - Name: Aubiere / Clermont Ferrand
  - Slot: Wed Apr 15 2020 12:00:00 GMT+0200
  Checking slot availability for 870... done
  Persisting slot in ./db/auchan-drive.db... done
  Notifying slack channel xxxxxxxxxxx... done
```

_See code: [src/commands/slot.ts](https://github.com/v-six/auchand-check/blob/v0.1.0/src/commands/slot.ts)_
<!-- commandsstop -->
