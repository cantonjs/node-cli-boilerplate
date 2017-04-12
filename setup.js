
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

const ask = (key) => new Promise((resolve) => {
	let defaults = pkg[key];
	if (typeof defaults === 'object') {
		defaults = Object.keys(defaults)[0];
	}
	rl.question(`${key} (${defaults}): `, (answer) => {
		answers[key] = answer || defaults;
		resolve();
	});
});

const oldName = pkg.name;

ask('name', 'name')
	.then(() => ask('description'))
	.then(() => ask('bin'))
	.then(() => ask('repository'))
	.then(() => ask('author'))
	.then(() => {
		rl.close();

		const command = answers.bin;
		answers.bin = { [command]: 'bin/index' };

		console.log(JSON.stringify(answers, null, 2));
		Object.assign(pkg, answers);

		const pkgFile = path.resolve(__dirname, 'package.json');
		const newPkg = JSON.stringify(pkg, null, 2);
		// console.log('\npackage.json:\n', newPkg);
		fs.writeFileSync(pkgFile, newPkg, 'utf8');

		const newName = answers.name;
		if (newName !== oldName) {
			const oldBinFile = path.resolve(__dirname, `bin/${oldName}`);
			const newBinFile = path.resolve(__dirname, `bin/${newName}`);
			fs.renameSync(oldBinFile, newBinFile);
		}

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
