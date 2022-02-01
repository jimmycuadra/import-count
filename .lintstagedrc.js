const ESLint = require("eslint").ESLint;

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file);
    })
  );
  const filteredFiles = files.filter((_, i) => !isIgnored[i]);
  return filteredFiles.join(" ");
};

const config = {
  "*": [
    async (files) => {
      const filesToLint = await removeIgnoredFiles(files);

      return `yarn run lint --fix --max-warnings=0 ${filesToLint}`;
    },
    "yarn run format",
    () => "yarn run tsc",
  ],
};

module.exports = config;
