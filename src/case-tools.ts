import {
	camelCase,
	constantCase,
	dotCase,
	headerCase,
	noCase,
	paramCase,
	pascalCase,
	pathCase,
	sentenceCase,
	snakeCase,
} from "change-case";
import * as vscode from "vscode";
import VSCodeTextTools from "./tools";

class CaseTools extends VSCodeTextTools {
	/**
	 * Register commands
	 */
	init(): void {
		const commands: { [key: string]: string } = {
			tolowercase: "toLowercase",
			touppercase: "toUpperCase",
			tosnakecase: "toSnakeCase",
			topascalsnakecase: "toPascalSnakeCase",
			toscreamingsnakecase: "toConstantCase",
			tocamelsnakecase: "toCamelSnakeCase",
			tocamelcase: "toCamelCase",
			toconstantcase: "toConstantCase",
			toheadercase: "toHeaderCase",
			totraincase: "toHeaderCase",
			tonocase: "toNoCase",
			toflatcase: "toFlatCase",
			todotcase: "toDotCase",
			toparamcase: "toParamCase",
			toscreamingparamcase: "toScreamingParamCase",
			topascalcase: "toPascalCase",
			topathcase: "toPathCase",
			tosentencecase: "toSentenceCase",
			tocapitalcase: "toCapitalCase",
			tospongececase: "toSpongeCase",
			totitlecase: "toTitleCase",
		};

		for (const command in commands) {
			const disposable = vscode.commands.registerCommand(
				`biati.texttools.${command}`,
				() => {
					const editor = vscode.window.activeTextEditor;
					const commandMethod = commands[command];
					const callback = this.getTask(commandMethod);

					if (typeof callback !== "function") {
						this.showNotification({
							message: `Tool ${command} not found`,
							type: "error",
						});
						return;
					}
					this.process(editor, callback);
				},
			);
			this.context.subscriptions.push(disposable);
		}
	}

	/**
	 * Lower Case
	 */
	toLowercase(text: string): string {
		return text.toLowerCase();
	}

	/**
	 * Upper Case
	 */
	toUpperCase(text: string): string {
		return text.toUpperCase();
	}

	/**
	 * Snake Case
	 */
	toSnakeCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return snakeCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Pascal Snake Case
	 */
	toPascalSnakeCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return pascalCase(this.normalizeText(line), { delimiter: "_" });
			})
			.join("\n");
	}

	/**
	 * Camel Snake Case
	 */
	toCamelSnakeCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return camelCase(this.normalizeText(line), { delimiter: "_" });
			})
			.join("\n");
	}

	/**
	 * Captal Case
	 */
	toCapitalCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return line.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
			})
			.join("\n");
	}

	/**
	 * Camel Case
	 */
	toCamelCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return camelCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Constant Case
	 */
	toConstantCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return constantCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Dot Case
	 */
	toDotCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return dotCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Header Case
	 */
	toHeaderCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return headerCase(line);
			})
			.join("\n");
	}

	/**
	 * No Case
	 */
	toNoCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return noCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Flat Case
	 */
	toFlatCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return noCase(this.normalizeText(line), { delimiter: "" });
			})
			.join("\n");
	}

	/**
	 * Param Case
	 */
	toParamCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return paramCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Screaming Param Case
	 */
	toScreamingParamCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return paramCase(this.normalizeText(line)).toUpperCase();
			})
			.join("\n");
	}

	/**
	 * Pascal Case
	 */
	toPascalCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return pascalCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Param Case
	 */
	toPathCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return pathCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Sentence Case
	 */
	toSentenceCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return sentenceCase(this.normalizeText(line));
			})
			.join("\n");
	}

	/**
	 * Sponge Case
	 */
	toSpongeCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				let result = "";
				for (let i = 0; i < line.length; i++) {
					result +=
						Math.random() > 0.5 ? line[i].toUpperCase() : line[i].toLowerCase();
				}
				return result;
			})
			.join("\n");
	}

	/**
	 * Title Case
	 */
	toTitleCase(text: string): string {
		const lines = text.split("\n");
		return lines
			.map((line) => {
				return this.titleCase(line.toLowerCase());
			})
			.join("\n");
	}

	titleCase(string: string): string {
		const SMALL_WORDS =
			/\b(?:an?d?|a[st]|because|but|by|en|for|i[fn]|neither|nor|o[fnr]|only|over|per|so|some|tha[tn]|the|to|up|upon|vs?\.?|versus|via|when|with|without|yet)\b/i;
		const TOKENS = /[^\s:–—-]+|./g;
		const WHITESPACE = /\s/;
		const IS_MANUAL_CASE = /.(?=[A-Z]|\..)/;
		const ALPHANUMERIC_PATTERN = /[A-Za-z0-9\u00C0-\u00FF]/;

		let result = "";
		let m;

		// tslint:disable-next-line
		while ((m = TOKENS.exec(string)) !== null) {
			const { 0: token, index } = m;

			if (
				// Ignore already capitalized words.
				!IS_MANUAL_CASE.test(token) &&
				// Ignore small words except at beginning or end.
				(!SMALL_WORDS.test(token) ||
					index === 0 ||
					index + token.length === string.length) &&
				// Ignore URLs.
				(string.charAt(index + token.length) !== ":" ||
					WHITESPACE.test(string.charAt(index + token.length + 1)))
			) {
				// Find and uppercase first word character, skips over *modifiers*.
				result += token.replace(ALPHANUMERIC_PATTERN, (m) => m.toUpperCase());
				continue;
			}

			result += token;
		}

		return result;
	}
}

export default CaseTools;
