import * as vscode from 'vscode';
import VSCodeTextTools from './tools';

class CounterTools extends VSCodeTextTools {

    /**
     * Register commands
     */
    init(context: vscode.ExtensionContext): void {
        let disposable;

        // words
        disposable = vscode.commands.registerCommand(`biati.texttools.countwords`, async () => {
            const editor = vscode.window.activeTextEditor;
            const response = await this.runTask(editor, 'countWords');

            if (typeof response === 'boolean') {
                return;
            }

            response.forEach(count => this.showNotification({ message: `Total words: ${count}` }));
        });
        context.subscriptions.push(disposable);

        // characters
        disposable = vscode.commands.registerCommand(`biati.texttools.countcharacters`, async () => {
            const editor = vscode.window.activeTextEditor;
            const response = await this.runTask(editor, 'countCharacters');

            if (typeof response === 'boolean') {
                return;
            }

            response.forEach(count => {
                let message = `Total (with spaces): ${count.full}, Total (without spaces): ${count.clean}`;
                this.showNotification({ message });
            });
        });
        context.subscriptions.push(disposable);

        // lines
        disposable = vscode.commands.registerCommand(`biati.texttools.countlines`, async () => {
            const editor = vscode.window.activeTextEditor;
            const response = await this.runTask(editor, 'countLines');

            if (typeof response === 'boolean') {
                return;
            }

            response.forEach(count => this.showNotification({ message: `Total lines: ${count}` }));
        });
        context.subscriptions.push(disposable);
    }


    /**
     * Count words
     */
    countWords(text: string): number {
        text = text.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        text = text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

        return text.split(' ').length;
    }

    /**
     * Count characters
     */
    countCharacters(text: string): { full: number, clean: number } {
        return {
            'full': text.length,
            'clean': text.match(/\S/g)?.length || 0
        };
    }

    /**
     * Count lines
     */
    countLines(text: string): number {
        const lines = text.split('\n');
        return lines.length;
    }
}

export default CounterTools;