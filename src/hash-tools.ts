import { createHash } from 'crypto';
import * as vscode from 'vscode';
import VSCodeTextTools from './tools';

class HashTools extends VSCodeTextTools {

    /**
     * Register commands
     */
    init(context: vscode.ExtensionContext): void {
        let disposable;

        disposable = vscode.commands.registerCommand(`biati.texttools.texttomd5`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.createHash, ['md5']);
        });
        context.subscriptions.push(disposable);

        disposable = vscode.commands.registerCommand(`biati.texttools.texttosha1`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.createHash, ['sha1']);
        });
        context.subscriptions.push(disposable);

        disposable = vscode.commands.registerCommand(`biati.texttools.texttosha256`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.createHash, ['sha256']);
        });
        context.subscriptions.push(disposable);

        disposable = vscode.commands.registerCommand(`biati.texttools.texttosha512`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.createHash, ['sha512']);
        });
        context.subscriptions.push(disposable);

    }

    createHash(text: string, type: string): string {
        switch (type) {
            case 'md5':
                text = createHash('md5').update(text).digest('hex');
                break;
            case 'sha1':
                text = createHash('sha1').update(text).digest('hex');
                break;
            case 'sha256':
                text = createHash('sha256').update(text).digest('hex');
                break;
            case 'sha512':
                text = createHash('sha512').update(text).digest('hex');
                break;
            default:
                break;
        }

        return text!.toUpperCase();;
    }
}

export default HashTools;