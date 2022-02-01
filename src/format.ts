import type { ImportCount } from "./importCountMap";

export const text = (importCounts: ImportCount[]) => {
  for (const importCount of importCounts) {
    if (importCount.kind === "default") {
      console.log(
        `import ${importCount.ident} from "${importCount.mod}": ${importCount.count}`
      );
    } else if (importCount.kind === "namespace") {
      console.log(
        `import * as ${importCount.ident} from "${importCount.mod}": ${importCount.count}`
      );
    } else {
      console.log(
        `import { ${importCount.ident} } from "${importCount.mod}": ${importCount.count}`
      );
    }
  }
};
