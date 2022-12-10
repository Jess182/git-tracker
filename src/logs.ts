import { cyan, green, red, yellow } from 'https://deno.land/std/fmt/colors.ts';

export const info = (message: string): void => console.info(green(message));
export const warn = (message: string): void => console.warn(yellow(message));
export const error = (message: string): void => console.error(red(message));
export const cyanPrompt = (
	message: string,
	defaultValue?: string,
): string | null => prompt(cyan(message), defaultValue);
