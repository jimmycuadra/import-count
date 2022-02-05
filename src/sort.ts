import type { FileCount, ImportCount } from "./count";

export const countDescending = (importCounts: ImportCount[]) => {
  return importCounts.sort((a, b) => {
    const aString = `${a.mod}.${a.ident}`;
    const bString = `${b.mod}.${b.ident}`;
    if (a.count === b.count) {
      return aString.localeCompare(bString);
    }

    return b.count - a.count;
  });
};

export const countFilesAscending = (fileCounts: FileCount[]) => {
  return fileCounts.sort((a, b) => {
    return a.count - b.count;
  });
};
