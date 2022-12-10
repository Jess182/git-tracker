export interface IOptions {
	platform: string;
	userId: string;
	accessToken: string;
	event: string;
	startDate?: string;
	endDate?: string;
	createFile?: boolean;
	fileName?: string;
	skipPrompt?: boolean;
}
