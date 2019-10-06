const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const defaultPadding = 4;
const defaultMigrationFolder = 'db-migrations';
const migrationFolder = process.argv[2] || defaultMigrationFolder;

const generate = (purpose, location) => {
  const files = fs.readdirSync(path.resolve(location)).filter(f => /[0-9]\.(do|undo)\..*\.sql/.test(f));
  const highestNumber = files.length
    ? (Math.max(...files.map(f => parseInt(f.split('.')[0], 10))) + 1).toString().padStart(defaultPadding, 0)
    : `0`.padStart(defaultPadding, 0);
  const variations = ['do', 'undo'].map(
    v =>
      `${path.resolve(location)}/${highestNumber}.${v}.${purpose
        .trim()
        .replace(/\s/g, '-')
        .replace('.', '-')}.sql`
  );

  variations.forEach(f => {
    fs.writeFileSync(f, '');
    console.log(chalk.green(`Created migration file ${f}`));
  });
};

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(chalk.bold.yellow(`What's the purpose of this migration, sire?\n`), purpose => {
  chalk.blue('generating migration files');
  generate(purpose, migrationFolder);
  readline.close();
});

module.exports = {
  generateNewMigration: generate
};
