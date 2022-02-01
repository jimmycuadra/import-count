import type { Ident, Import } from "./parser";

interface Count {
  count: number;
}

type IdentCount = Ident & Count;

export type ImportCount = Import & Count;

export class ImportCountMap {
  #map: Record<string, Record<string, IdentCount>>;

  constructor() {
    this.#map = {};
  }

  increment({ ident, kind, mod }: Import): void {
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

  list() {
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

export default ImportCountMap;
