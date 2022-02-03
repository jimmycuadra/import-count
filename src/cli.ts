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

export const run = async (version: string) => {
  const command = new Command("import-count")
    .version(version)
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);

  command
    .command("most-common")
    .argument(
      "<dir>",
      "absolute or relative path to a directory containing JS and/or JSX source files"
    )
    .option("--json", "output JSON instead of human-readable text")
    .description(
      "print the number of occurrences of each unique import found in the files within <dir>"
    )
    .action(mostCommon);

  await command.parseAsync();
};
