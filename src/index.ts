import { readFile } from "fs/promises";
import { dirname, resolve } from "path";

import { Parser as BaseParser } from "acorn";
import acornJsx from "acorn-jsx";
import type { Program } from "estree";

type Source = string;
type Specifier = {
  name: string;
  isDefault: boolean;
};
type Count = number;

const Parser = BaseParser.extend(acornJsx());

class ImportCountMap {
  #inner: Record<Source, Map<string, Count>>;

  constructor() {
    this.#inner = {};
  }

  increment(source: string, specifier: Specifier): void {
    if (this.#inner[source] == null) {
      this.#inner[source] = new Map();
    }

    const sourceCountMap = this.#inner[source];

    if (sourceCountMap != null) {
      const key = specifier.name + '.' + specifier.isDefault.toString();
      const currentCount = sourceCountMap.get(key);

      if (currentCount == null) {
        sourceCountMap.set(key, 1);
      } else {
        sourceCountMap.set(key, currentCount + 1);
      }
    }
  }

  print() {
    const lines: {
      source: string;
      specifier: Specifier;
      count: number;
    }[] = [];

    for (const source of Object.keys(this.#inner)) {
      const specifierCountMap = this.#inner[source];

      if (specifierCountMap != null) {
        for (const [specifierString, count] of specifierCountMap) {
          const [name, isDefault] = specifierString.split(".");
          const spec = { name: name!, isDefault: Boolean(isDefault) };
          lines.push({
            source,
            specifier: spec,
            count,
          });
        }
      }
    }

    lines.sort((a, b) => {
      const aString = `${a.source}.${a.specifier.name}`;
      const bString = `${b.source}.${b.specifier.name}`;
      if (a.count === b.count) {
        return aString.localeCompare(bString);
      }

      return b.count - a.count;
    });

    for (const line of lines) {
      if (line.specifier.isDefault) {
        console.log(
          `import ${line.specifier.name} from "${line.source}": ${line.count}`
        );
      } else {
        console.log(
          `import { ${line.specifier.name} } from "${line.source}": ${line.count}`
        );
      }
    }
  }
}

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

export const parsePaths = async (rootPath: string, paths: string[]) => {
  const importCountMap = new ImportCountMap();

  for (const path of paths) {
    Object.assign(
      importCountMap,
      await parsePath(rootPath, path, importCountMap)
    );
  }

  return importCountMap;
};

export const parsePath = async (
  rootPath: string,
  path: string,
  importCountMap = new ImportCountMap()
) => {
  const sourceCode = await readFile(path, "utf8");

  const root = Parser.parse(sourceCode, {
    ecmaVersion: "latest",
    sourceType: "module",
  }) as unknown as Program;

  for (const node of root.body) {
    if (node.type === "ImportDeclaration") {
      if (typeof node.source.value == "string") {
        for (const specifier of node.specifiers) {
          let name;
          let isDefault = false;

          if (specifier.type === "ImportSpecifier") {
            name = specifier.imported.name;
          } else if (specifier.type === "ImportDefaultSpecifier") {
            name = specifier.local.name;
            isDefault = true;
          } else {
            name = "*";
          }

          importCountMap.increment(
            resolveImportSource(rootPath, path, node.source.value),
            { name, isDefault }
          );
        }
      }
    }
  }

  return importCountMap;
};
