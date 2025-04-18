import { createHash } from "node:crypto";
import * as vscode from "vscode";
import VSCodeTextTools from "./tools";

class HashTools extends VSCodeTextTools {
	/**
	 * Register commands
	 */
	init(): void {
		let disposable: vscode.Disposable;

		disposable = vscode.commands.registerCommand(
			"biati.texttools.texttomd5",
			async () => {
				const editor = vscode.window.activeTextEditor;
				this.process(editor, this.createHash, ["md5"]);
			},
		);
		this.context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand(
			"biati.texttools.texttosha1",
			async () => {
				const editor = vscode.window.activeTextEditor;
				this.process(editor, this.createHash, ["sha1"]);
			},
		);
		this.context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand(
			"biati.texttools.texttosha256",
			async () => {
				const editor = vscode.window.activeTextEditor;
				this.process(editor, this.createHash, ["sha256"]);
			},
		);
		this.context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand(
			"biati.texttools.texttosha512",
			async () => {
				const editor = vscode.window.activeTextEditor;
				this.process(editor, this.createHash, ["sha512"]);
			},
		);
		this.context.subscriptions.push(disposable);
	}

	createHash(text: string, type: string): string {
		let newText = text;
		switch (type) {
			case "md5":
				newText = createHash("md5").update(text).digest("hex");
				break;
			case "sha1":
				newText = createHash("sha1").update(text).digest("hex");
				break;
			case "sha256":
				newText = createHash("sha256").update(text).digest("hex");
				break;
			case "sha512":
				newText = createHash("sha512").update(text).digest("hex");
				break;
			default:
				break;
		}

		return newText ? newText.toUpperCase() : "";
	}
}

export default HashTools;
