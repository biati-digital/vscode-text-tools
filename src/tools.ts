import { spawn } from 'child_process';
import * as vscode from 'vscode';

/**
 * VS Code Text Tools
 * created by https://www.biati.digital
 */
class VSCodeTextTools {
    constructor() { }

    /**
     * Return task
     */
    getTask(name: string): Function | boolean {
        const fn = this[name as keyof VSCodeTextTools];
        if (typeof fn === 'function') {
            return fn;
        }
        return false;
    }

    /**
     * Run task
     */
    async runTask(editor: vscode.TextEditor | undefined, name: string | Function): Promise<boolean | any[]> {
        const fn = typeof name === 'function' ? name : this.getTask(name);
        if (!editor || typeof fn !== 'function') {
            return false;
        }

        const { document, selections } = editor;
        let isEmptySelection = !selections || selections.length === 1 && selections[0].start.line === selections[0].end.line && selections[0].start.character === selections[0].end.character;
        let selectionLoop: vscode.Range[] | vscode.Selection[] = [...selections];
        if (isEmptySelection) {
            const firstLine = editor.document.lineAt(0);
            const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
            selectionLoop = [new vscode.Range(0,
                firstLine.range.start.character,
                editor.document.lineCount - 1,
                lastLine.range.end.character
            )];
        }

        const responses = [];
        for (const selection of selectionLoop) {
            const text = document.getText(selection);
            const response = fn.apply(this, [text, selection]);
            responses.push(response);
        }

        return responses;
    }

    /**
     * Process
     * process action for each selected range
     * if no selection then the entire content will
     * be processed
     */
    process(editor: vscode.TextEditor | undefined, fn: Function, fnArgs: any[] = [], action: string = 'replace'): void {
        if (!editor) {
            return;
        }

        const { document, selections } = editor;

        editor.edit(builder => {
            let isEmptySelection = !selections || selections.length === 1 && selections[0].start.line === selections[0].end.line && selections[0].start.character === selections[0].end.character;

            let selectionLoop: vscode.Range[] | vscode.Selection[] = [...selections];

            if (isEmptySelection) {
                const firstLine = editor.document.lineAt(0);
                const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
                selectionLoop = [new vscode.Range(0,
                    firstLine.range.start.character,
                    editor.document.lineCount - 1,
                    lastLine.range.end.character
                )];
            }

            for (const selection of selectionLoop) {
                const text = document.getText(selection);
                const response = fn.apply(this, [text, ...fnArgs, selection]);

                if (!response && typeof response !== 'string') {
                    return false;
                }

                if (action === 'replace') {
                    builder.replace(selection, response);
                } else if (action === 'insert') {
                    let insertAt = isEmptySelection ? editor.selection.active : new vscode.Position(selection.start.line, selection.start.character);
                    builder.insert(insertAt, response);
                }
            }
        });
    }

    /**
     * Normalize text
     * resolve diacritics, accents, etc.
     */
    normalizeText(text: string): string {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Escape string
     *
     * @param {string} string
     */
    escape(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Open in new document
     */
    async newDocument(content: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument({
            content,
        });
        vscode.window.showTextDocument(document);
    }

    /**
     * Show Notification in editor
     */
    showNotification({ title, message, type }: { title?: string, message: string, type?: string }) {
        switch (type) {
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
            default:
                vscode.window.showInformationMessage(message);
                break;
        }
    }

    /**
     * Execute shell command
     */
    execShellCommand(cmd: string, args: string[], opts = {}): Promise<{ error: string, output: string }> {
        return new Promise(function (resolve, reject) {
            const options = { detached: true, shell: true };
            const runner = spawn(cmd, args, { ...options, ...opts });
            let data = { error: '', output: '' };

            if (runner?.pid) {
                console.log('spawn started with process id', runner);
            }

            runner.stdout.setEncoding('utf8');
            runner.stdout.on('data', (stdout) => {
                const out: string = stdout.toString();
                data.output += out;
            });

            runner.stderr.setEncoding('utf8');
            runner.stderr.on('data', (stderr) => {
                const err = stderr.toString();
                data.error += err;
            });

            runner.on('close', (exitCode: number) => {
                if (exitCode === 0) {
                    data.error = '';
                }
                if (exitCode && exitCode > 0) {
                    data.output = '';
                }
                runner.kill();
                resolve(data);
            });
        });
    }

}

export default VSCodeTextTools;