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
import-count

Usage: import-count COMMAND [...OPTIONS]

Commands:

  most-common DIR [--json]

    Print every import found in the JS and JSX files in DIR, sorted with the
    most frequently occurring first. By default, the output is human-readable,
    with each line showing the import as it would appear in JavaScript code,
    followed by the number of times that identifier was imported from that
    module. If the --json flag is given, the output will be JSON, where the keys
    are module names and the values are an array of objects representing each
    identifier imported from that module, including the kind of import (named,
    default, or namespace), and the number of times that identifier was imported
    from that module.
```

## Legal

import-count is released under the MIT license. See `LICENSE` for details.
