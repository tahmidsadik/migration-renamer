const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const Fuse = require('fuse.js');
const chalk = require('chalk');

const defaultPadding = 4;
const defaultMigrationFolder = 'db-migrations';

const getMigrationFiles = () => {
  return fs
    .readdirSync(path.resolve(defaultMigrationFolder))
    .filter(f => /[0-9]\.(do|undo)\..*\.sql/.test(f))
    .reverse();
};

const migrationsFiles = getMigrationFiles().map(f => ({
  title: f
}));

const fuseOptions = {
  keys: ['title'],
  threshold: 0.5
};

const fuse = new Fuse(migrationsFiles, fuseOptions);

const rename = (fromMigration, toMigration, dryRun = true) => {
  getMigrationFiles()
    .filter(f => /[0-9]\.(do|undo)\..*\.sql/.test(f))
    .filter(f => parseInt(f.split('.')[0], 10) >= fromMigration)
    .map(f => {
      const [first, ...rest] = f.split('.');
      const serialId = parseInt(first, 10);
      const newSerial = (serialId + toMigration - fromMigration).toString().padStart(defaultPadding, 0);
      const restFileName = `.${rest.join('.')}`;

      if (dryRun) {
        console.log(
          `${chalk.yellow(first)}${chalk.gray(restFileName)} => ${chalk.green(newSerial)}${chalk.gray(restFileName)}`
        );
      } else {
        fs.renameSync(
          path.resolve(defaultMigrationFolder, f),
          path.resolve(defaultMigrationFolder, f.replace(/[0-9]*/, newSerial))
        );
      }
    });
};

const handleRename = async (fromMigration, toMigration) => {
  rename(fromMigration, toMigration);

  const confirmation = await prompts({
    type: 'toggle',
    name: 'proceed',
    message: 'Do you want to proceed with renaming?',
    initial: false,
    active: 'yes',
    inactive: 'no'
  });
  if (confirmation.proceed) {
    rename(fromMigration, toMigration, false);
  }
};

(async () => {
  const response = await prompts([
    {
      type: 'autocomplete',
      name: 'migration',
      message: `So you want to rename a bunch of migrations? Choose the ${chalk.yellow(
        'first file'
      )} to get started.\n(type a few characters to ${chalk.green('fuzzy filter')} your result)\n`,
      limit: 10,
      choices: [],
      suggest: async (input, _choices) => {
        if (!input) {
          return migrationsFiles;
        }
        return fuse.search(input);
      }
    },
    {
      type: 'number',
      name: 'serial',
      min: prev => {
        return parseInt(prev.split('.')[0], 10);
      },
      max: 1000,
      message: 'Enter the new serial number for the file'
    }
  ]);

  await handleRename(parseInt(response.migration.split('.')[0], 10), response.serial);
})();
