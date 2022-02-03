import type { Ident, Import } from "./parse";

interface Count {
  count: number;
}

interface File {
  path: string;
}

type IdentCount = Ident & Count;

export type ImportCount = Import & Count;

export type FileCount = File & Count;

export class ImportMap {
  #files: Record<string, number>;
  #map: Record<string, Record<string, IdentCount>>;

  constructor() {
    this.#map = {};
    this.#files = {};
  }

  increment(path: string, { ident, kind, mod }: Import): void {
    const fileCount = this.#files[path];

    if (fileCount == null) {
      this.#files[path] = 1;
    } else {
      this.#files[path] += 1;
    }

    const sourceCountMap = this.#map[mod] ?? (this.#map[mod] = {});

    const key = ident + "." + kind;

    const identOccurrence = sourceCountMap[key];

    if (identOccurrence == null) {
      sourceCountMap[key] = {
        count: 1,
        ident,
        kind,
      };
    } else {
      identOccurrence.count += 1;
    }
  }

  listFiles(rootPath: string) {
    return Object.keys(this.#files).reduce((acc, path) => {
      const count = this.#files[path];

      if (count != null) {
        acc.push({
          path: path.replace(rootPath, "").slice(1),
          count,
        });
      }

      return acc;
    }, [] as FileCount[]);
  }

  listImports() {
    return Object.keys(this.#map).reduce((acc, mod) => {
      const idents = this.#map[mod];

      if (idents != null) {
        for (const identString of Object.keys(idents)) {
          const identCount = idents[identString];

          if (identCount) {
            acc.push({
              ...identCount,
              mod,
            });
          }
        }
      }

      return acc;
    }, [] as ImportCount[]);
  }
}

export default ImportMap;
