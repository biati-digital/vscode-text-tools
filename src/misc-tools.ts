import * as vscode from 'vscode';
import VSCodeTextTools from './tools';

class MiscTools extends VSCodeTextTools {

    /**
     * Register commands
     */
    init(context: vscode.ExtensionContext): void {
        const commands: { [key: string]: string } = {
            addallnumbers: 'addAllNumbers',
            substractallnumbers: 'substractAllNumbers'
        };

        for (const command in commands) {
            let disposable = vscode.commands.registerCommand(`biati.texttools.${command}`, () => {
                const editor = vscode.window.activeTextEditor;
                const commandMethod = commands[command];
                const callback = this.getTask(commandMethod);

                if (typeof callback !== 'function') {
                    this.showNotification({ message: `Tool ${command} not found`, type: 'error' });
                    return;
                }
                this.process(editor, callback);
            });
            context.subscriptions.push(disposable);
        }
    }


    /**
     * Add All Numbers
     */
    addAllNumbers(text: string): string {
        const lines = text.split('\n');
        const sum = lines.reduce((acc, val) => {
            let lineval = 0;
            if (val && val.trim()) {
                let value: string | number = val;
                value = value.replace(/[^0-9\.,-]+/g, '');
                value = parseFloat(value.replace(/,/g, ''));
                lineval = value;
            }
            return acc + lineval;
        }, 0);

        return sum.toFixed(2).toString();
    }

    /**
     * Substract All Numbers
     */
    substractAllNumbers(text: string): string {
        const lines = text.split('\n');
        const sum = lines.reduce((acc, val) => {
            let lineval = 0;
            if (val && val.trim()) {
                let value: string | number = val;
                value = value.replace(/[^0-9\.,-]+/g, '');
                value = parseFloat(value.replace(/,/g, ''));
                lineval = value;
            }
            if (acc === null) {
                return lineval;
            }
            return acc - lineval;
        }, 0);

        return sum.toFixed(2).toString();
    }
}

export default MiscTools;