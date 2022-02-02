import { normalize, resolve, sep } from "path";
import { Command } from "commander";

import glob from "glob";

import { countDescending, json, parsePaths, text } from "./";

const mostCommon = async (rawRootPath: string, options: { json: boolean }) => {
  const normalizedRootPath = normalize(rawRootPath);

  const rootPath =
    normalizedRootPath[normalizedRootPath.length - 1] === sep
      ? normalizedRootPath.slice(0, -1)
      : normalizedRootPath;

  glob(
    `${rootPath}/**/*.js{,x}`,
    {
      ignore: [`${rootPath}/**/node_modules/**/*`],
    },
    async (err, paths) => {
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

      const importMap = await parsePaths(
        resolve(rootPath),
        paths.map((path) => resolve(path))
      );

      const sorted = countDescending(importMap.list());

      if (sorted.length === 0) {
        console.error("No import statements found.");
        process.exit(1);
      } else if (options.json) {
        console.log(json(sorted));
      } else {
        text(sorted).forEach((line) => console.log(line));
      }
    }
  );
};

export const run = async () => {
  const command = new Command("import-count").version("0.1.1");

  command
    .command("most-common")
    .argument(
      "<dir>",
      `Absolute or relative path to a directory containing
            JS and/or JSX source files.`
    )
    .option("--json", "Output JSON instead of human-readable text.")
    .description(
      `Print every import found in the JS and JSX files in <dir>, sorted with the
most frequently occurring first. By default, the output is human-readable,
with each line showing the import as it would appear in JavaScript code,
followed by the number of times that identifier was imported from that
module. If the --json flag is given, the output will be JSON, where the keys
are module names and the values are an array of objects representing each
identifier imported from that module, including the kind of import (named,
default, or namespace), and the number of times that identifier was imported
from that module.`
    )
    .action(mostCommon);

  await command.parseAsync();
};
