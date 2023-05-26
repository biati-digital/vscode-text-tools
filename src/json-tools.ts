import unserialize from 'locutus/php/var/unserialize';
import * as vscode from 'vscode';
import VSCodeTextTools from './tools';

class JsonTools extends VSCodeTextTools {

    /**
     * Register commands
     */
    init(context: vscode.ExtensionContext): void {
        let disposable;

        disposable = vscode.commands.registerCommand(`biati.texttools.jsonstringparse`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.jsonStringParse);
        });
        context.subscriptions.push(disposable);
    }


    /**
     * Parse JSON String
     */
    jsonStringParse(text: string) {
        if (!text.trim()) {
            return false;
        }

        let parsed: string | boolean = '';
        try {
            parsed = this.maybeUnserialize(text);

            if (typeof parsed === 'string' && parsed.startsWith('{')) {
                parsed = JSON.parse(parsed.replace(/\\/g, ''));
            }
            if (!parsed) {
                parsed = JSON.parse(text);
            }
            parsed = JSON.stringify(parsed, undefined, 2);
        } catch (error) {
            vscode.window.showInformationMessage(`JSON Error: ${error}`);
        }

        return parsed;
    }

    /**
     * Maybe Unserialize
     */
    maybeUnserialize(text: string): string | boolean {
        let unserialized = false;
        try {
            unserialized = unserialize(text);
        } catch (error) {
            console.error(error);
        }
        return unserialized;
    }
}

export default JsonTools;