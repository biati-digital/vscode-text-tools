import * as vscode from "vscode";
import VSCodeTextTools from "./tools";

class GenerateTools extends VSCodeTextTools {
	/**
	 * Register commands
	 */
	init(): void {
		const disposable: vscode.Disposable = vscode.commands.registerCommand(
			"biati.texttools.generatedummyfile",
			async () => {
				const workspace = vscode.workspace;
				if (!workspace || !workspace?.workspaceFolders) {
					vscode.window.showInformationMessage("You need an active workspace");
					return;
				}
				const workspaceDir = workspace?.workspaceFolders[0].uri;
				const filename = await vscode.window.showInputBox({
					placeHolder: "filename.txt",
					prompt: "Enter file name with extension",
				});

				if (!filename) {
					return;
				}

				const filesize = await vscode.window.showInputBox({
					prompt: "Filesize for example: 500kb, 10mb, 1gb",
				});
				if (!filesize) {
					return;
				}

				const generate = await this.generateFile(
					workspaceDir,
					filename,
					filesize,
				);
				if (generate) {
					this.showNotification({ message: "File generated correctly" });
				} else {
					this.showNotification({
						message: "Error generating dummy file",
						type: "error",
					});
				}
			},
		);
		this.context.subscriptions.push(disposable);
	}

	/**
	 * Generate file
	 */
	async generateFile(filePath: vscode.Uri, fileName: string, size: string) {
		if (!filePath) {
			throw new Error("File path must be provided");
		}
		if (!fileName) {
			throw new Error("File name must be provided");
		}

		size = size.toLowerCase().replace(/\s/g, "").replace(/,/, "");
		size = size.replace(/([0-9.]+)(gigabytes|gigas|giga|gbs|gb)/i, (r1, r2) => {
			return r2 + "gb";
		});
		size = size.replace(/([0-9.]+)(megabytes|megabyte|mbs|mb)/i, (r1, r2) => {
			return r2 + "mb";
		});
		size = size.replace(/([0-9.]+)(kilobytes|kilobyte|kbs|kb)/i, (r1, r2) => {
			return r2 + "kb";
		});
		size = size.replace(/([0-9.]+)(bytes|byte|bs|b)/i, (r1, r2) => {
			return r2;
		});

		const bMatch = size.match(/^(\d+)$/i);
		const kbMatch = size.match(/^(\d+)kb$/i);
		const mbMatch = size.match(/^(\d+)mb/i);
		const gbMatch = size.match(/^(\d+)gb/i);

		let isZip = "";
		let isTar = "";

		// Handle Zip files
		if (fileName.endsWith(".zip")) {
			isZip = vscode.Uri.joinPath(filePath, fileName).path;
			fileName = fileName.replace(".zip", ".txt");
		}
		// Handle Tar files
		if (fileName.endsWith(".tar")) {
			isTar = vscode.Uri.joinPath(filePath, fileName).path;
			fileName = fileName.replace(".tar", ".txt");
		}

		let finalFilePath = vscode.Uri.joinPath(filePath, fileName).path;

		let finalSize = 0;

		if (bMatch) {
			finalSize = +bMatch[1];
		}
		if (kbMatch) {
			finalSize = +kbMatch[1] * 1000;
		}
		if (mbMatch) {
			finalSize = +mbMatch[1] * 1000 * 1000;
		}
		if (gbMatch) {
			finalSize = +gbMatch[1] * 1000 * 1000 * 1000;
		}

		if (finalSize <= 0) {
			throw new Error("File size must be provided");
		}

		if (finalSize >= 30000000000) {
			throw new Error("File size limit is 30GB just in case");
		}

		let generatedFile: string | null = finalFilePath;
		try {
			await this.execShellCommand("mkfile", [
				"-n",
				finalSize.toString(),
				finalFilePath,
			]);
			if (isZip) {
				await this.execShellCommand("zip", ["-m", "-0", isZip, finalFilePath]);
			}
			if (isTar) {
				await this.execShellCommand("tar", ["-cf", isTar, finalFilePath]);
			}
		} catch (error) {
			generatedFile = null;
		}

		return generatedFile;
	}
}

export default GenerateTools;
