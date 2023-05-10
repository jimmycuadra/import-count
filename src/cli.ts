import fs from 'fs';
import {normalize, resolve, sep} from 'path';
import {Command} from 'commander';
import glob from 'glob';

import Counter from './count';
import {filesAsJson, filesAsText, importsAsJson, importsAsText} from './format';
import {parsePaths} from './parse';
import {sortFiles, sortImports} from './sort';

const withCounter = async <Item>(
    rawRootPath: string,
    getItems: (rootPath: string, counter: Counter) => Item[],
    useItems: (items: Item[]) => void
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

            const counter = await parsePaths(
                resolvedRootPath,
                paths.map((path) => resolve(path))
            );

            const items = getItems(resolvedRootPath, counter);

            if (items.length === 0) {
                console.error('No import statements found.');
                process.exit(1);
            } else {
                useItems(items);
            }
        }
    );
};

const mostCommon = (
    rawRootPath: string,
    options: {json: boolean; save: boolean}
) => {
    return withCounter(
        rawRootPath,
        (_, counter) => {
            return sortImports(counter.listImports());
        },
        (items) => {
            if (options.json) {
                const toPrint = importsAsJson(items);

                if (options.save) {
                    fs.writeFileSync(
                        resolve(process.cwd(), './import-count.json'),
                        toPrint,
                        'utf-8'
                    );
                    return;
                }

                console.log(toPrint);
            } else {
                importsAsText(items).forEach((line) => console.log(line));
            }
        }
    );
};

const fewestImports = (
    rawRootPath: string,
    options: {json: boolean; save: boolean}
) => {
    return withCounter(
        rawRootPath,
        (rootPath, counter) => {
            return sortFiles(counter.listFiles(rootPath));
        },
        (items) => {
            if (options.json) {
                const toPrint = filesAsJson(items);

                if (options.save) {
                    fs.writeFileSync(
                        resolve(process.cwd(), './import-count.json'),
                        toPrint,
                        'utf-8'
                    );
                    return;
                }

                console.log(toPrint);
            } else {
                filesAsText(items).forEach((line) => console.log(line));
            }
        }
    );
};

export const run = async (version: string) => {
    const command = new Command('import-count')
        .version(version)
        .showHelpAfterError(true)
        .showSuggestionAfterError(true);

    command
        .command('most-common')
        .argument(
            '<dir>',
            'absolute or relative path to a directory containing JS and/or JSX source files'
        )
        .option('--json', 'output JSON instead of human-readable text')
        .option('--save', 'saves the output instead of printing to the console')
        .description(
            'print each unique import found in <dir> along with its number of occurrences, sorted by most frequently occurring'
        )
        .action(mostCommon);

    command
        .command('fewest-imports')
        .argument(
            '<dir>',
            'absolute or relative path to a directory containing JS and/or JSX source files'
        )
        .option('--json', 'output JSON instead of human-readable text')
        .option('--save', 'saves the output instead of printing to the console')
        .description(
            'print each file in <dir> with its number of imports, sorted by fewest imports'
        )
        .action(fewestImports);

    await command.parseAsync();
};
