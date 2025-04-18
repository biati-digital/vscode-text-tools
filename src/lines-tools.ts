import * as vscode from "vscode";
import VSCodeTextTools from "./tools";

class LinesTools extends VSCodeTextTools {
	/**
	 * Register commands
	 */
	init(): void {
		const commands: { [key: string]: string } = {
			sortalphanumerically: "sortLinesAlphanumerically",
			sortalphanumericallyreverse: "sortLinesAlphanumericallyReverse",
			sortbylength: "sortLinesByLength",
			sortbylengthreverse: "sortLinesByLengthReverse",
			deleteduplicates: "deleteDuplicates",
			deleteemptylines: "deleteEmptyLines",
			filterduplucates: "filterDuplicates",
			filterduplucatesnew: "filterDuplicatesNewDoc",
			filteruniques: "filterUniques",
			filteruniquesnew: "filterUniquesNewDoc",
			reverselines: "reverseLines",
			randomlines: "randomLines",
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

		// This are comands that require prompt
		const commandsPrompt: {
			[key: string]: {
				command: string;
				prompt?: string;
				placeHolder?: string;
				allowEmpty?: boolean;
				action?: string;
			};
		} = {
			splittolines: {
				command: "splitToLines",
				prompt: "Split Text at the specified delimiter",
				placeHolder: "Delimiter",
			},
			joinlines: {
				command: "joinLines",
				prompt: "Join Lines using delimiter",
				placeHolder: "Delimiter",
				allowEmpty: true,
			},
			deletelinesmatching: {
				command: "deleteLinesMatching",
				prompt: "Delete Lines Matching...",
			},
			filterlinesmatching: {
				command: "filterLinesMatching",
				prompt: "Keep Lines Matching...",
			},
			filterlinesmatchingnew: {
				command: "filterLinesMatchingNewDoc",
				prompt: "Keep Lines Matching...",
			},
			wrapeachlinewith: {
				command: "wrapLinesWith",
				prompt: "Wrap Lines with...",
				placeHolder: "<li>$1</li>",
			},
			appendtolines: {
				command: "appendToLines",
				prompt: "Enter text to add at the beginning",
			},
			prependtolines: {
				command: "prependToLines",
				prompt: "Enter text to add at the end",
			},
			selectlinesmatching: {
				command: "selectLinesMatching",
				prompt: "Select Lines Matching...",
				action: "select",
			},
		};

		for (const command in commandsPrompt) {
			const commandData = commandsPrompt[command];

			const disposable = vscode.commands.registerCommand(
				`biati.texttools.${command}`,
				async () => {
					const editor = vscode.window.activeTextEditor;
					const callback = this.getTask(commandData.command);

					if (typeof callback !== "function") {
						vscode.window.showInformationMessage(`Tool ${command} not found`);
						return;
					}

					const allowEmpty = commandData?.allowEmpty ?? false;
					const answer = await vscode.window.showInputBox({
						placeHolder: commandData?.placeHolder,
						prompt: commandData?.prompt,
					});

					if (!allowEmpty && !answer) {
						return;
					}

					this.process(editor, callback, [answer], commandData?.action);
				},
			);
			this.context.subscriptions.push(disposable);
		}

		// Add lines number
		const disposable = vscode.commands.registerCommand(
			"biati.texttools.addlinesnumber",
			async () => {
				const editor = vscode.window.activeTextEditor;
				const selected = await vscode.window.showQuickPick(
					[
						"Add Line Numbers with 1 ",
						"Add Line Numbers with 1.",
						"Add Line Numbers with 1)",
						"Add Line Numbers with 1.-",
						"Add Line Numbers with 1 -",
						"Add Line Numbers with 1:",
						"Add Line Numbers with Ordinal",
						"Add Line Numbers with Roman Numerals",
					],
					{ placeHolder: "Select format" },
				);

				if (!selected) {
					return;
				}

				this.process(editor, this.addLinesNumbers, [selected]);
			},
		);
		this.context.subscriptions.push(disposable);
	}

	/**
	 * Filter lines
	 */
	filterLines(
		text: string,
		search: string,
		keep = true,
		caseSensitive = false,
	): string {
		const parseSearch = regexSearchParser(search);
		const isRegex = parseSearch.isRegex;
		const isMatchStart = parseSearch.isMatchStart;
		const isMatchEnd = parseSearch.isMatchEnd;
		const isNot = parseSearch.isNot;

		search = parseSearch.search;

		const lines = text.split("\n");
		return lines
			.filter((line) => {
				if (line.trim() === "") {
					return line;
				}

				let match = null;
				if (typeof isRegex !== "boolean") {
					if (isMatchStart) {
						line = line.trimStart();
					}
					if (isMatchEnd) {
						line = line.trimEnd();
					}

					try {
						match = line.match(isRegex);
					} catch (error) {}
				} else if (isMatchStart) {
					match = line.trimStart().startsWith(search);
				} else if (isMatchEnd) {
					match = line.trimEnd().endsWith(search);
				} else {
					match = line.includes(search);
				}

				if (
					(match === true && isNot === true) ||
					(match === false && isNot === true) ||
					keep === false
				) {
					match = !match;
				}

				return match;
			})
			.join("\n");
	}

	/**
	 * Delete duplicates from text
	 */
	deleteDuplicates(text: string): string {
		const lines = text.split("\n");
		return [...new Set(lines)].join("\n");
	}

	/**
	 * Delete Empty Lines
	 */
	deleteEmptyLines(text: string): string {
		const lines = text.split("\n");
		return lines.filter((line) => line.trim() !== "").join("\n");
	}

	/**
	 * Delete Lines Matching
	 */
	deleteLinesMatching(text: string, search: string): string {
		return this.filterLines(text, search, false);
	}

	/**
	 * Filter duplicates
	 */
	filterDuplicates(text: string): string {
		const lines = text.split("\n");
		const set = new Set(lines);
		const duplicates = lines.filter((line) => {
			if (set.has(line)) {
				set.delete(line);
			} else {
				return line;
			}
		});

		return [...new Set(duplicates)].join("\n");
	}

	/**
	 * Filter duplicates new doc
	 */
	filterDuplicatesNewDoc(text: string): boolean {
		const lines = text.split("\n");
		const set = new Set(lines);
		const duplicates = lines.filter((line) => {
			if (set.has(line)) {
				set.delete(line);
			} else {
				return line;
			}
		});

		this.newDocument([...new Set(duplicates)].join("\n"));

		return false;
	}

	/**
	 * Remove values that are not unique
	 * remove all elements that occur more than once from array
	 * ['php', 'python', 'javascript', 'rust', 'php', 'python'];
	 * after filtered will look
	 * ['javascript', 'rust'];
	 */
	filterUniques(text: string): string {
		const lines = text.split("\n");
		return lines
			.filter((line) => {
				return lines.lastIndexOf(line) === lines.indexOf(line);
			})
			.join("\n");
	}

	/**
	 * Filter uniques
	 * in a new document
	 * see filterUniques
	 *
	 * @param {null}
	 */
	filterUniquesNewDoc(text: string): boolean {
		const filtered = this.filterUniques(text);
		this.newDocument(filtered);

		return false;
	}

	/**
	 * Filter Lines Matching
	 */
	filterLinesMatching(text: string, search: string): string {
		return this.filterLines(text, search, true);
	}

	/**
	 * Filter Lines Matching
	 */
	filterLinesMatchingNewDoc(text: string, search: string): boolean {
		this.newDocument(this.filterLines(text, search, true));
		return false;
	}

	/**
	 * Sort Lines
	 */
	sortLinesAlphanumerically(text: string): string {
		const lines = text.split("\n");
		const firstLineIndent = lines[0].match(/^[\s]*/g);
		const lastLineIndent = lines[lines.length - 1].match(/^[\s]*/g);

		const sorted = lines.sort((a, b) => {
			return a.localeCompare(b, undefined, {
				numeric: true,
				sensitivity: "case",
			});
		});

		if (firstLineIndent) {
			sorted[0] = sorted[0].replace(/^[\s]*/g, firstLineIndent[0]);
		}
		if (lastLineIndent) {
			sorted[lines.length - 1] = sorted[lines.length - 1].replace(
				/^[\s]*/g,
				lastLineIndent[0],
			);
		}

		return sorted.join("\n");
	}

	/**
	 * Sort Lines Reverse
	 */
	sortLinesAlphanumericallyReverse(text: string): string {
		const lines = text.split("\n");
		const firstLineIndent = lines[0].match(/^[\s]*/g);
		const lastLineIndent = lines[lines.length - 1].match(/^[\s]*/g);

		const sorted = lines
			.sort((a, b) => {
				return a.localeCompare(b, undefined, {
					numeric: true,
					sensitivity: "case",
				});
			})
			.reverse();

		if (firstLineIndent) {
			sorted[0] = sorted[0].replace(/^[\s]*/g, firstLineIndent[0]);
		}
		if (lastLineIndent) {
			sorted[lines.length - 1] = sorted[lines.length - 1].replace(
				/^[\s]*/g,
				lastLineIndent[0],
			);
		}

		return sorted.join("\n");
	}

	/**
	 * Sort Lines by length
	 */
	sortLinesByLength(text: string): string {
		const lines = text.split("\n");
		const firstLineIndent = lines[0].match(/^[\s]*/g);
		const lastLineIndent = lines[lines.length - 1].match(/^[\s]*/g);

		const sorted = lines.sort((a, b) => {
			return a.length - b.length;
		});

		if (firstLineIndent) {
			sorted[0] = sorted[0].replace(/^[\s]*/g, firstLineIndent[0]);
		}
		if (lastLineIndent) {
			sorted[lines.length - 1] = sorted[lines.length - 1].replace(
				/^[\s]*/g,
				lastLineIndent[0],
			);
		}

		return sorted.join("\n");
	}

	/**
	 * Sort Lines by length Reverse
	 */
	sortLinesByLengthReverse(text: string): string {
		const lines = text.split("\n");
		const firstLineIndent = lines[0].match(/^[\s]*/g);
		const lastLineIndent = lines[lines.length - 1].match(/^[\s]*/g);

		const sorted = lines.sort((a, b) => {
			return b.length - a.length;
		});

		if (firstLineIndent) {
			sorted[0] = sorted[0].replace(/^[\s]*/g, firstLineIndent[0]);
		}
		if (lastLineIndent) {
			sorted[lines.length - 1] = sorted[lines.length - 1].replace(
				/^[\s]*/g,
				lastLineIndent[0],
			);
		}

		return sorted.join("\n");
	}

	/**
	 * Reverse Lines
	 */
	reverseLines(text: string): string {
		const lines = text.split("\n");
		const firstLineIndent = lines[0].match(/^[\s]*/g);
		const lastLineIndent = lines[lines.length - 1].match(/^[\s]*/g);

		return lines
			.reverse()
			.map((line, index) => {
				if (index === 0 && firstLineIndent) {
					line = line.replace(/^[\s]*/g, firstLineIndent[0]);
				}
				if (index === lines.length - 1 && lastLineIndent) {
					line = line.replace(/^[\s]*/g, lastLineIndent[0]);
				}
				return line;
			})
			.join("\n");
	}

	/**
	 * Join Lines
	 * TODO: Join Lines Convert to vscode
	 */
	joinLines(text: string, delimiter: string): string {
		return text.split("\n").join(delimiter);
	}

	/**
	 * Split Text to lines
	 * TODO: Split Text Convert to vscode
	 */
	splitToLines(text: string, delimiter: string): string {
		return text
			.split(delimiter)
			.map((line) => {
				return line.trimStart();
			})
			.join("\n");
	}

	/**
	 * Randomize Line
	 */
	randomLines(text: string): string {
		return this.randomArray(text.split("\n")).join("\n");
	}

	/**
	 * Add Lines Numbers
	 */
	addLinesNumbers(text: string, format: string): string {
		format = format.replace("Add Line Numbers with 1", "");
		format = format.replace("Add Line Numbers with ", "");

		const lines = text.split("\n");
		const firstLineIndent = lines[0].match(/^[\s]*/g);
		const lastLineIndent = lines[lines.length - 1].match(/^[\s]*/g);

		const ordered = lines.map((line, i) => {
			i = i + 1;
			let whitespace = line.match(/^[\s]*/g);
			let leading = "";

			if (whitespace && whitespace[0]) {
				leading = whitespace[0];
			}

			let prefix = i.toString();
			switch (format) {
				case "Ordinal":
					prefix = ordinalSuffix(i);
					line = `${leading}${prefix} ${line.trimStart()}`;
					break;
				case "Roman Numerals":
					prefix = romanize(i);
					line = `${leading}${prefix} ${line.trimStart()}`;
					break;
				default:
					line = `${leading}${prefix}${format} ${line.trimStart()}`;
			}

			return line;
		});

		if (firstLineIndent) {
			ordered[0] = ordered[0].replace(/^[\s]*/g, firstLineIndent[0]);
		}
		if (lastLineIndent) {
			ordered[lines.length - 1] = ordered[lines.length - 1].replace(
				/^[\s]*/g,
				lastLineIndent[0],
			);
		}

		return ordered.join("\n");
	}

	/**
	 * Wrap lines with
	 */
	wrapLinesWith(text: string, wrap: string): string {
		const lines = text.split("\n");
		const wrapped = lines.map((line) => {
			const whitespace = line.match(/^[\s]*/g);
			let newLine = wrap;

			if (whitespace && whitespace[0]) {
				newLine = whitespace[0] + newLine;
			}

			return newLine.replace("$1", line.trim());
		});
		return wrapped.join("\n");
	}

	/**
	 * Append to lines
	 */
	appendToLines(text: string, insert: string): string {
		const lines = text.split("\n");
		const appended = lines.map((line) => {
			const whitespace = line.match(/^[\s]*/g);
			let newLine = insert + line;

			if (whitespace && whitespace[0]) {
				newLine = whitespace[0] + insert + line.trimStart();
			}

			return newLine;
		});

		return appended.join("\n");
	}

	/**
	 * Prepend to lines
	 */
	prependToLines(text: string, insert: string): string {
		const lines = text.split("\n");
		const prepended = lines.map((line) => {
			return line + insert;
		});
		return prepended.join("\n");
	}

	/**
	 * Select Lines Matching
	 */
	selectLinesMatching(
		text: string,
		search: string,
		selection: vscode.Selection,
	): void {
		if (!vscode.window.activeTextEditor) {
			return;
		}

		const editor = vscode.window?.activeTextEditor;
		const lines = text.split("\n");
		const parseSearch = regexSearchParser(search);
		const isRegex = parseSearch.isRegex;
		const isMatchStart = parseSearch.isMatchStart;
		const isMatchEnd = parseSearch.isMatchEnd;
		const isNot = parseSearch.isNot;

		search = parseSearch.search;

		const newRanges: vscode.Selection[] = [];

		lines.forEach((line, index) => {
			const originalLine = line;
			line = this.escape(line);

			let match = null;
			if (typeof isRegex !== "boolean") {
				if (isMatchStart) {
					line = line.trimStart();
				}
				if (isMatchEnd) {
					line = line.trimEnd();
				}

				try {
					match = line.match(isRegex);
				} catch (error) {}
			} else if (isMatchStart) {
				match = line.trimStart().startsWith(search);
			} else if (isMatchEnd) {
				match = line.trimEnd().endsWith(search);
			} else {
				match = line.includes(search);
			}

			if (
				(match === true && isNot === true) ||
				(match === false && isNot === true)
			) {
				match = !match;
			}

			if (match) {
				const lineAt = vscode.window?.activeTextEditor?.document.lineAt(
					new vscode.Position(index, 1),
				);

				if (lineAt?.range) {
					newRanges.push(
						new vscode.Selection(
							new vscode.Position(lineAt.range.start.line, 0),
							new vscode.Position(lineAt.range.end.line, originalLine.length),
						),
					);
				}
			}
		});

		if (editor) {
			editor.selections = newRanges;
		}
	}

	/**
	 * Select All Ocurrences matching
	 * check all ocurrences that matches a specific query
	 *
	 * NOT implemented, vscode search can already do this
	 */
	selectAllOcurrencesMatching() {}

	/**
	 * Random Array
	 * randomize items order
	 *
	 * @param {array} array
	 */
	randomArray(array: string[]) {
		var currentIndex = array.length,
			randomIndex;
		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex],
				array[currentIndex],
			];
		}

		return array;
	}
}

function regexSearchParser(
	search: string,
	caseSensitive = false,
): {
	isFullRegex: null | RegExpMatchArray;
	isRegex: RegExp | boolean;
	isMatchStart: boolean;
	isMatchEnd: boolean;
	isNot: boolean;
	search: string;
} {
	const isFullRegex = search.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
	let isRegex: RegExp | boolean = false;
	const isMatchStart = search.startsWith("^");
	const isMatchEnd = search.endsWith("$");
	const isNot = search.startsWith("!");
	const defaultModifier = caseSensitive ? "g" : "gi";

	if (isFullRegex) {
		let modifiers = isFullRegex[3];
		if (!modifiers) {
			modifiers = defaultModifier;
		}
		isRegex = new RegExp(isFullRegex[2], modifiers);
	} else {
		if (isMatchStart) {
			const check = search.slice(1).toLowerCase();
			const isStringRegexLike = isRegexLike(check);

			if (isStringRegexLike) {
				isRegex = new RegExp(search, defaultModifier);
			}
			if (!isStringRegexLike) {
				search = search.slice(1);
			}
		} else if (isMatchEnd) {
			const check = search.slice(0, -1).toLowerCase();
			const isStringRegexLike = isRegexLike(check);

			if (isStringRegexLike) {
				isRegex = new RegExp(search, defaultModifier);
			}
			if (!isStringRegexLike) {
				search = search.slice(0, -1);
			}
		} else if (isNot) {
			const check = search.slice(1);
			const isStringRegexLike = isRegexLike(check);

			if (isStringRegexLike) {
				isRegex = new RegExp(search, defaultModifier);
			}
			if (!isStringRegexLike) {
				search = search.slice(1);
			}
		} else {
			const isStringRegexLike = isRegexLike(search);
			if (search.length > 1 && isStringRegexLike) {
				isRegex = new RegExp(search, defaultModifier);
			}
		}
	}

	return {
		isFullRegex: isFullRegex,
		isRegex: isRegex,
		isMatchStart: isMatchStart,
		isMatchEnd: isMatchEnd,
		isNot: isNot,
		search: search,
	};
}

/**
 * Escape string
 *
 * @param {string} string
 */
function isRegexLike(string: string): boolean {
	return /\\w|\\s|\\d|\\b|\\.|\.\*|\.\+/.test(string);
}

/**
 * Ordinal suffix
 * example 1st, 2nd, etc.
 *
 * @param {numeric} i
 */
function ordinalSuffix(i: number): string {
	var j = i % 10,
		k = i % 100;
	if (j === 1 && k !== 11) {
		return i + "st";
	}
	if (j === 2 && k !== 12) {
		return i + "nd";
	}
	if (j === 3 && k !== 13) {
		return i + "rd";
	}
	return i + "th";
}

/**
 * Romanize
 * convert number to it's roman counterpart
 *
 * @param {number}
 */
function romanize(num: number): string {
	if (isNaN(num)) {
		return "";
	}
	var digits = String(+num).split(""),
		key = [
			"",
			"C",
			"CC",
			"CCC",
			"CD",
			"D",
			"DC",
			"DCC",
			"DCCC",
			"CM",
			"",
			"X",
			"XX",
			"XXX",
			"XL",
			"L",
			"LX",
			"LXX",
			"LXXX",
			"XC",
			"",
			"I",
			"II",
			"III",
			"IV",
			"V",
			"VI",
			"VII",
			"VIII",
			"IX",
		],
		roman = "",
		i = 3;
	while (i--) {
		let popped = digits.pop();
		if (popped) {
			roman = (key[+popped + i * 10] || "") + roman;
		}
	}

	return Array(+digits.join("") + 1).join("M") + roman;
}

export default LinesTools;
