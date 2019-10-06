const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const defaultPadding = 4;
const defaultMigrationFolder = './../shopup-lite/db-migrations';

const getMigrationFiles = () => {
  return fs
    .readdirSync(path.resolve(defaultMigrationFolder))
    .filter(f => /[0-9]\.(do|undo)\..*\.sql/.test(f))
    .reverse();
};

const rename = (fromMigration, toMigration, dryRun = true) => {
  getMigrationFiles()
    .filter(f => /[0-9]\.(do|undo)\..*\.sql/.test(f))
    .filter(f => parseInt(f.split('.')[0], 10) >= fromMigration)
    .map(f => {
      const serialId = parseInt(f.split('.')[0], 10);
      const newSerial = (serialId + toMigration - fromMigration).toString().padStart(defaultPadding, 0);

      if (dryRun) {
        console.log(`${f} => ${f.replace(/[0-9]*/, newSerial)}`);
      } else {
        fs.renameSync(
          path.join(__dirname, defaultMigrationFolder, f),
          path.join(__dirname, defaultMigrationFolder, f.replace(/[0-9]*/, newSerial))
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
  const files = getMigrationFiles();

  const response = await prompts([
    {
      type: 'autocomplete',
      name: 'migration',
      message: 'So you want to rename a bunch of migrations? Choose the first file to get started',
      limit: 10,
      choices: files.map(f => ({
        title: f
      }))
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
