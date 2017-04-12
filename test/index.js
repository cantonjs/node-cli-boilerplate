
import { execSync } from 'child_process';
import { resolve } from 'path';

describe('test', () => {
	it('🌚 ', () => {
		const bin = resolve('bin/node-cli-boilerplate');
		console.log(execSync(`${bin}`, { encoding: 'utf8' }));
	});
});
