import { readFile } from "fs/promises";
import { dirname, resolve } from "path";

import { Parser as BaseParser } from "acorn";
import acornJsx from "acorn-jsx";
import type { Program } from "estree";

import ImportMap from "./map";

export interface Ident {
  ident: string;
  kind: "named" | "default" | "namespace";
}

export interface Import extends Ident {
  mod: string;
}

const Parser = BaseParser.extend(acornJsx());

const resolveImportSource = (
  rootPath: string,
  path: string,
  source: string
) => {
  if (source[0] === ".") {
    return resolve(dirname(path), source).replace(
      new RegExp(`${rootPath}/?`),
      "./"
    );
  } else {
    return source;
  }
};

const trackImports = (
  body: Program["body"],
  rootPath: string,
  path: string,
  cb: (imp: Import) => void
) => {
  return body.forEach((node) => {
    if (node.type === "ImportDeclaration") {
      if (typeof node.source.value == "string") {
        for (const specifier of node.specifiers) {
          let ident;
          let kind;

          if (specifier.type === "ImportSpecifier") {
            ident = specifier.imported.name;
            kind = "named" as const;
          } else if (specifier.type === "ImportDefaultSpecifier") {
            ident = specifier.local.name;
            kind = "default" as const;
          } else {
            ident = specifier.local.name;
            kind = "namespace" as const;
          }

          cb({
            mod: resolveImportSource(rootPath, path, node.source.value),
            ident,
            kind,
          });
        }
      }
    }
  }, [] as Import[]);
};

export const parsePaths = async (rootPath: string, paths: string[]) => {
  const importMap = new ImportMap();

  for (const path of paths) {
    Object.assign(importMap, await parsePath(rootPath, path, importMap));
  }

  return importMap;
};

export const parsePath = async (
  rootPath: string,
  path: string,
  importCountMap = new ImportMap()
) => {
  const sourceCode = await readFile(path, "utf8");

  const root = Parser.parse(sourceCode, {
    ecmaVersion: "latest",
    sourceType: "module",
  }) as unknown as Program;

  trackImports(root.body, rootPath, path, (imp) =>
    importCountMap.increment(imp)
  );

  return importCountMap;
};
