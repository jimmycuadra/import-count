# import-count

**import-count** is a command line interface for analyzing import statements in JavaScript code.

## Installation

With npm:

```
npm install import-count
```

With yarn:

```
yarn global add import-count
```

## Synopsis

```
Usage: import-count [options] [command]

Options:
  -V, --version                   output the version number
  -h, --help                      display help for command

Commands:
  most-common [options] <dir>     print each unique import found in <dir> along
                                  with its number of occurrences, sorted by most
                                  frequently occurring
  fewest-imports [options] <dir>  print each file in <dir> with its number of
                                  imports, sorted by fewest imports
  help [command]                  display help for command
```

## Legal

import-count is released under the MIT license. See `LICENSE` for details.
