import { GitPlatform } from './GitPlatform.ts';
import { IOptions } from './types.ts';
import { info, warn } from './logs.ts';

const API_VERSION = 'v4';

export class Gitlab extends GitPlatform {
	protected buildUrl({
		userId,
		accessToken,
		event,
		startDate,
		endDate,
	}: IOptions): URL {
		const url = new URL(
			`http://gitlab.com/api/${API_VERSION}/users/${userId}/events`,
		);

		const queryParams: Record<string, string> = {
			per_page: '100',
			private_token: accessToken,
			action: event,
		};

		if (endDate) {
			queryParams['before'] = endDate;
		}

		if (startDate) {
			queryParams['after'] = startDate;
		}

		url.search = new URLSearchParams(queryParams).toString();

		return url;
	}

	async getEvents(options: IOptions): Promise<Record<string, string>[]> {
		const response = await fetch(this.buildUrl(options));

		const data = await response?.json();

		if (!data || data.error) {
			warn(`Bad request: ${data.error}`);
			return [];
		}

		info(`Events found: ${data.length}`);

		return data;
	}

	buildCsv(event: string, data: Record<string, any>[]): string {
		let csv = '';

		switch (event) {
			case 'pushed': {
				const headers = [
					'ProjectId',
					'Username',

					'Action',
					'Branch',
					'Commit',
					'Created at',
				];

				csv += this.buildCsvRow(headers);

				data
					.forEach((event) => {
						csv += this.buildCsvRow([
							event.project_id,
							event.author.username,

							event.push_data.action,
							event.push_data.ref,
							event.push_data.commit_title,
							event.created_at,
						]);
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
