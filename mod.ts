import { cyanPrompt, error } from './src/logs.ts';
import { IOptions } from './src/types.ts';
import { GitPlatform } from './src/gitPlatform.ts';
import { Gitlab } from './src/gitlab.ts';
import { Github } from './src/github.ts';

const DEFAULT_EVENTS: Record<string, string> = {
	gitlab: 'pushed',
	github: 'PushEvent',
};

function getUserArgs({
	platform,
	userId,
	accessToken,
	event,
	startDate,
	endDate,
	createFile,
	fileName,
	skipPrompt,
}: IOptions): IOptions {
	if (!skipPrompt) {
		platform = platform?.toLowerCase() ||
			(cyanPrompt('Enter remote git platform:', 'gitlab') as string)
				?.toLowerCase();
		event = event ||
			(cyanPrompt(
				'Enter even type:',
				DEFAULT_EVENTS[platform],
			) as string);
		userId = userId || (cyanPrompt('Enter user ID:') as string);
		accessToken = accessToken || (cyanPrompt('Enter private key:') as string);
		startDate = startDate ||
			(cyanPrompt('Enter start date [YYYY-MM-DD] (optional):') as string);
		endDate = endDate ||
			(cyanPrompt('Enter end date [YYYY-MM-DD] (optional):') as string);
		fileName = fileName ||
			(cyanPrompt('Enter file name (optional):') as string);
	}

	return {
		platform,
		userId,
		accessToken,
		event,
		startDate,
		endDate,
		createFile,
		fileName,
	};
}

function parseOptions(options: IOptions): IOptions {
	options.platform = options.platform?.toLowerCase() || 'gitlab';

	options.event = options.event || DEFAULT_EVENTS[options.platform];

	if (
		(options.platform === 'gitlab' &&
			(!options.userId || !options.accessToken)) ||
		(options.platform === 'github' && !options.userId)
	) {
		throw new Error('Missing options to complete task');
	}

	return options;
}

function platformFactory(platform: string): GitPlatform {
	switch (platform) {
		case 'gitlab':
			return new Gitlab();
		case 'github':
			return new Github();
		default:
			throw new Deno.errors.InvalidData(
				`Platform '${platform}' not supported! :(`,
			);
	}
}

/**
 * Function that returns csv (and [optionally] create file) about git user activities (max 100)
 *
 * @param options - A set of options for building csv
 * @returns Promise csv string
 *
 * Example:
 *
 * ```ts
 * import { gitTracker, IOptions } from 'https://raw.githubusercontent.com/Jess182/git-tracker/main/mod.ts';
 *
 * const options: IOptions = {
 * 	platform: 'gitlab',
 * 	userId: '<user ID>',
 * 	accessToken: '<private key>',
 * 	event: 'pushed',
 * createFile: true,
 * };
 *
 * const csv = await gitTracker(options);
 * ```
 */
export async function gitTracker(
	options: IOptions,
): Promise<string> {
	try {
		options = parseOptions(options);

		const platform = _internals.platformFactory(options.platform);

		const events = await platform.getEvents(options);

		const csv = events?.length ? platform.buildCsv(options.event, events) : '';

		if (options.createFile) {
			const path = `${Deno.cwd()}/${options.fileName || 'git-tracker'}.csv`;
			Deno.writeTextFileSync(path, csv);
		}

		return csv;
	} catch (e) {
		error(`[Git tracker] Error ocurred: ${e}`);
		throw e;
	}
}

export type { IOptions };

export const _internals = { platformFactory };

if (import.meta.main) {
	try {
		const { parse } = await import('https://deno.land/std/flags/mod.ts');

		await gitTracker(getUserArgs({ ...parse(Deno.args), createFile: true }));
	} catch (_e) {
		Deno.exit(1);
	}
}
