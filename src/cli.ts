import { normalize, resolve, sep } from "path";
import { Command } from "commander";

import glob from "glob";

import {
  ImportMap,
  countDescending,
  countFilesAscending,
  json,
  jsonFiles,
  parsePaths,
  text,
  textFiles,
} from "./";

const createImportMap = async (
  rawRootPath: string,
  callback: (rootPath: string, importMap: ImportMap) => void
) => {
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

      const resolvedRootPath = resolve(rootPath);

      const importMap = await parsePaths(
        resolvedRootPath,
        paths.map((path) => resolve(path))
      );

      callback(resolvedRootPath, importMap);
    }
  );
};

const mostCommon = (rawRootPath: string, options: { json: boolean }) => {
  return createImportMap(rawRootPath, (_, importMap) => {
    const sorted = countDescending(importMap.listImports());

    if (sorted.length === 0) {
      console.error("No import statements found.");
      process.exit(1);
    } else if (options.json) {
      console.log(json(sorted));
    } else {
      text(sorted).forEach((line) => console.log(line));
    }
  });
};

const fewestImports = (rawRootPath: string, options: { json: boolean }) => {
  return createImportMap(rawRootPath, (rootPath, importMap) => {
    const sorted = countFilesAscending(importMap.listFiles(rootPath));

    if (sorted.length === 0) {
      console.error("No import statements found.");
      process.exit(1);
    } else if (options.json) {
      console.log(jsonFiles(sorted));
    } else {
      textFiles(sorted).forEach((line) => console.log(line));
    }
  });
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
      "print each unique import found in <dir> along with its number of occurrences, sorted by most frequently occurring"
    )
    .action(mostCommon);

  command
    .command("fewest-imports")
    .argument(
      "<dir>",
      "absolute or relative path to a directory containing JS and/or JSX source files"
    )
    .option("--json", "output JSON instead of human-readable text")
    .description(
      "print each file in <dir> with its number of imports, sorted by fewest imports"
    )
    .action(fewestImports);

  await command.parseAsync();
};
