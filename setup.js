
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const readline = require('readline');
const os = require('os');
const pkg = require('./package.json');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const answers = {};

const ask = (key, defaultValue) => new Promise((resolve) => {
	if (!defaultValue) { defaultValue = pkg[key]; }
	rl.question(`${key} (${defaultValue}): `, (answer) => {
		answers[key] = answer || defaultValue;
		resolve();
	});
});

const defaultName = path.basename(__dirname);

ask('name', defaultName)
	.then(() => ask('description', defaultName))
	.then(() => ask('bin', defaultName))
	.then(() => ask('repository', `cantonjs/${defaultName}`))
	.then(() => ask('author'))
	.then(() => {
		rl.close();

		answers.bin = { [answers.bin]: 'bin/index' };

		console.log(JSON.stringify(answers, null, 2));
		Object.assign(pkg, answers);

		const pkgFile = path.resolve(__dirname, 'package.json');
		const newPkg = JSON.stringify(pkg, null, 2);
		// console.log('\npackage.json:\n', newPkg);
		fs.writeFileSync(pkgFile, newPkg, 'utf8');

		const isWindows = /^win32/.test(os.platform());
		const rimrafCommand = isWindows ? 'rd /s /q' : 'rm -rf';
		const gitDir = path.resolve(__dirname, '.git');
		// console.log(`${rimrafCommand} ${gitDir}`);
		childProcess.exec(`${rimrafCommand} ${gitDir}`);

		console.log('Success.\n');
		console.log('To install dependencies, please run `yarn` manually.\n');

		fs.unlinkSync(__filename);
	})
	.catch((err) => { throw err; })
;
