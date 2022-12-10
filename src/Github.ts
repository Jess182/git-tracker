import { encode } from 'https://deno.land/std/encoding/base64.ts';
import { GitPlatform } from './GitPlatform.ts';
import { IOptions } from './types.ts';
import { info } from './logs.ts';

export class Github extends GitPlatform {
	protected buildUrl({
		userId,
	}: IOptions): URL {
		const url = new URL(
			`https://api.github.com/users/${userId}/events`,
		);

		url.search = new URLSearchParams({
			per_page: '100',
		}).toString();

		return url;
	}

	async getEvents(options: IOptions): Promise<Record<string, string>[]> {
		const fetchOptions: { headers?: Headers } = {};

		if (options.userId && options.accessToken) {
			const headers = new Headers();
			headers.set(
				'Authorization',
				'Basic ' + encode(options.userId + ':' + options.accessToken),
			);

			fetchOptions.headers = headers;
		}

		const response = await fetch(this.buildUrl(options), fetchOptions);

		let data: Record<string, string>[] = await response?.json();

		data = data.filter((event) => event.type === options.event);

		if (options.startDate) {
			data = data.filter((event) =>
				new Date(event.created_at).getTime() >=
					new Date(options.startDate!).getTime()
			);
		}

		if (options.endDate) {
			data = data.filter((event) =>
				new Date(event.created_at).getTime() <=
					new Date(options.endDate!).getTime()
			);
		}

		info(`Events found: ${data.length}`);

		return data;
	}

	buildCsv(event: string, data: Record<string, any>[]): string {
		let csv = '';

		switch (event) {
			case 'PushEvent': {
				const headers = [
					'Repo',
					'Username',

					'Action',
					'Commit',
					'Commit URL',
					'Created at',
				];

				csv += this.buildCsvRow(headers);

				data.forEach((event) => {
					event.payload.commits.forEach((commit: Record<string, string>) => {
						csv += this.buildCsvRow([
							event.repo.name,
							event.actor.login,

							event.type,
							commit.message,
							commit.url,
							event.created_at,
						]);
					});
				});

				return csv;
			}
			default:
				throw new Deno.errors.InvalidData(
					`Event '${event}' for gitlab not supported! :(`,
				);
		}
	}
}
