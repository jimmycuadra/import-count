#!/usr/bin/env node

import { normalize, resolve, sep } from "path";

import glob from "glob";

import { parsePaths } from "./";

const main = async () => {
  const rawRootPath = process.argv[process.argv.length - 1];

  if (rawRootPath == null) {
    console.error(
      "A directory containing JavaScript source files must be given."
    );
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

    const importCountMap = await parsePaths(
      resolve(rootPath),
      paths.map((path) => resolve(path))
    );

    importCountMap.print();
  });
};

main();
