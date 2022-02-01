import type { ImportCount } from "./map";

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

export const json = (importCounts: ImportCount[]) => {
  const json = importCounts.reduce((acc, importCount) => {
    const imp = {
      count: importCount.count,
      ident: importCount.ident,
      kind: importCount.kind,
    };

    const modImports = acc[importCount.mod];

    if (modImports == null) {
      acc[importCount.mod] = [imp];
    } else {
      modImports.push(imp);
    }

    return acc;
  }, {} as { [mod: string]: Omit<ImportCount, "mod">[] });

  console.log(JSON.stringify(json));
};
