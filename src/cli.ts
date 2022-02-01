import { normalize, resolve, sep } from "path";

import glob from "glob";

import { countDescending, json, parsePaths, text } from "./";

const mostCommon = async (args: string[]) => {
  const rawRootPath = args[0];

  if (rawRootPath == null) {
    console.error("Error: Missing required argument: DIR");
    process.exit(1);
  }

  const normalizedRootPath = normalize(rawRootPath);

  const rootPath =
    normalizedRootPath[normalizedRootPath.length - 1] === sep
      ? normalizedRootPath.slice(0, -1)
      : normalizedRootPath;

  glob(`${rootPath}/**/*.js{,x}`, async (err, paths) => {
    if (err != null) {
      console.error(err);
      process.exit(1);
    }

    if (paths.length === 0) {
      console.error(
        `Error: No JS or JSX source files found under path "${rootPath}".`
      );
      process.exit(1);
    }

    const importCountMap = await parsePaths(
      resolve(rootPath),
      paths.map((path) => resolve(path))
    );

    const sorted = countDescending(importCountMap.list());

    if (args[1] === "--json") {
      console.log(json(sorted));
    } else {
      text(sorted).forEach((line) => console.log(line));
    }
  });
};

const help = () => {
  console.log(`
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
`);
};

export const run = async () => {
  const args = process.argv.slice(2);

  if (args[0] === "most-common") {
    mostCommon(args.slice(1));
  } else if (args[0] === "help" || args[0] === "--help") {
    help();
  } else {
    console.log(
      "Error: A command is required! Run `import-count help` to list commands."
    );
    process.exit(1);
  }
};
