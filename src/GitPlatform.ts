import { IOptions } from './types.ts';

export abstract class GitPlatform {
	protected abstract buildUrl(params: IOptions): URL;
	abstract getEvents(args: IOptions): Promise<Record<string, string>[]>;
	abstract buildCsv(
		event: string,
		data: Record<string, any>[],
	): string;
	buildCsvRow = (data: string[]) => `${data.join(',')}\r\n`;
}
