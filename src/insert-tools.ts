import uuid from "uuid-random";
import * as vscode from "vscode";
import VSCodeTextTools from "./tools";

class InsertTools extends VSCodeTextTools {
	/**
	 * Register commands
	 */
	init(): void {
		const insertionCommands: { [key: string]: string } = {
			generateuuid: "generateUUID",
			fakedata: "generateFakeData",
			nonbreakingspace: "nonBreakingSpace",
		};

		for (const command in insertionCommands) {
			const disposable = vscode.commands.registerCommand(
				`biati.texttools.${command}`,
				() => {
					const editor = vscode.window.activeTextEditor;
					const commandMethod = insertionCommands[command];
					const callback = this.getTask(commandMethod);

					if (typeof callback !== "function") {
						this.showNotification({
							message: `Tool ${command} not found`,
							type: "error",
						});
						return;
					}
					this.process(editor, callback, [], "insert");
				},
			);
			this.context.subscriptions.push(disposable);
		}
	}

	/**
	 * Generate UUID
	 */
	generateUUID() {
		return uuid();
	}

	/**
	 * Insert non-breaking space
	 */
	nonBreakingSpace() {
		return "&nbsp;";
	}
}

export default InsertTools;
