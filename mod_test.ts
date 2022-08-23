import { stub } from 'https://deno.land/std/testing/mock.ts';
import {
	assertExists,
	assertRejects,
} from 'https://deno.land/std/testing/asserts.ts';
import { _internals, gitTracker } from './mod.ts';
import { Gitlab } from './_src/gitlab.ts';
import { assertThrows } from 'https://deno.land/std@0.152.0/testing/asserts.ts';

const GIT_TRACKER_OPTIONS = {
	platform: 'gitlab',
	userId: 'userID',
	accessToken: 'accessToken',
	event: 'pushed',
};

const mockedGitPlatform = {
	getEvents: () => Promise.resolve([{}]),
	buildCsv: () => '',
	buildUrl: () => new URL(''),
	buildCsvRow: () => '',
} as any;

Deno.test('Git tracker - Should pass when set all options', async () => {
	let platformFactoryStub, csv;

	try {
		platformFactoryStub = stub(
			_internals,
			'platformFactory',
			() => mockedGitPlatform,
		);
		csv = await gitTracker(GIT_TRACKER_OPTIONS);
	} finally {
		platformFactoryStub?.restore();
	}

	assertExists(csv);
});

Deno.test('Git tracker - Should fail when set incorrect platform', () => {
	const gitTrackerOptions = { ...GIT_TRACKER_OPTIONS, platform: 'bitbucket' };
	assertRejects(() => gitTracker(gitTrackerOptions), Deno.errors.InvalidData);
});
