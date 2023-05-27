import serialize from 'locutus/php/var/serialize';
import unserialize from 'locutus/php/var/unserialize';
import * as vscode from 'vscode';
import VSCodeTextTools from './tools';

class JsonTools extends VSCodeTextTools {

    /**
     * Register commands
     */
    init(context: vscode.ExtensionContext): void {
        let disposable;

        disposable = vscode.commands.registerCommand(`biati.texttools.jsonstringencode`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.jsonEncode);
        });
        context.subscriptions.push(disposable);

        disposable = vscode.commands.registerCommand(`biati.texttools.jsonstringdecode`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.jsonDecode);
        });
        context.subscriptions.push(disposable);

        disposable = vscode.commands.registerCommand(`biati.texttools.jsonstringserialize`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.jsonSerialize);
        });
        context.subscriptions.push(disposable);

        disposable = vscode.commands.registerCommand(`biati.texttools.jsonstringunserialize`, async () => {
            const editor = vscode.window.activeTextEditor;
            this.process(editor, this.jsonUnserialize);
        });
        context.subscriptions.push(disposable);
    }

    /**
     * Serialize
     */
    jsonSerialize(text: string) {
        if (!text.trim()) {
            return '';
        }
        let parsed: string | boolean = '';
        try {
            text = text.trim().replace(/^ {2,}/gm, ' ');
            text = text.replace(/(\r\n|\n|\r)/gm, "");
            text = text.replace('{ "', '{"');
            text = text.replace(': "', ':"');
            let serialized = serialize(text.trim());
            parsed = serialized;
        } catch (error) {
            parsed = false;
            this.showNotification({
                message: `Error: Unable to serialize`,
                type: 'error'
            });
        }

        return parsed;
    }


    /**
     * Unserialize
     */
    jsonUnserialize(text: string) {
        if (!text.trim()) {
            return '';
        }
        let parsed: string | boolean = '';
        try {
            let unserialized = unserialize(text.trim());
            parsed = JSON.parse(unserialized.replace(/\\/g, ''));
            parsed = JSON.stringify(parsed, undefined, 2);
        } catch (error) {
            parsed = false;
            this.showNotification({
                message: `Error: Unable to unserialize`,
                type: 'error'
            });
        }

        return parsed;
    }


    /**
     * Encode
     */
    jsonEncode(text: string): string {
        text = JSON.stringify(text);
        return text.substring(1, text.length - 1);
    }


    /**
     * Decode
     */
    jsonDecode(text: string): string {
        try {
            let unserialized = unserialize(text);
            if (typeof unserialized === 'string' && unserialized.startsWith('{')) {
                text = JSON.parse(unserialized.replace(/\\/g, ''));
                text = JSON.stringify(text, undefined, 2);
            }
            if (typeof unserialized === 'boolean' && !unserialized) {
                text = this.unscape(text);
            }
        } catch (error) {
            text = this.unscape(text);
        }

        return text;
    }

    unscape(text: string): string {
        let plain = '';
        const iter = text[Symbol.iterator]();
        let cur: IteratorResult<string>;
        while (!(cur = iter.next()).done) {
            if (cur.value === '\\') {
                cur = iter.next();
                if (cur.done) {
                    plain += '\\';
                    break;
                }
                else if (cur.value === '"') {
                    plain += '"';
                }
                else if (cur.value === '\\') {
                    plain += '\\';
                }
                else if (cur.value === '/') {
                    plain += '/';
                }
                else if (cur.value === 'b') {
                    plain += '\b';
                }
                else if (cur.value === 'f') {
                    plain += '\f';
                }
                else if (cur.value === 'n') {
                    plain += '\n';
                }
                else if (cur.value === 'r') {
                    plain += '\r';
                }
                else if (cur.value === 't') {
                    plain += '\t';
                }
                else if (cur.value === 'u') {
                    const one = iter.next();
                    if (one.done) {
                        plain += '\\u';
                    }
                    else if (!this.isHexDigit(one.value)) {
                        plain += '\\u' + one.value;
                    }
                    else {
                        const two = iter.next();
                        if (two.done) {
                            plain += '\\u' + one.value;
                        }
                        else if (!this.isHexDigit(two.value)) {
                            plain += '\\u' + one.value + two.value;
                        }
                        else {
                            const three = iter.next();
                            if (three.done) {
                                plain += '\\u' + one.value + two.value;
                            }
                            else if (!this.isHexDigit(three.value)) {
                                plain += '\\u' + one.value + two.value + three.value;
                            }
                            else {
                                const four = iter.next();
                                if (four.done) {
                                    plain += '\\u' + one.value + two.value + three.value;
                                }
                                else if (!this.isHexDigit(four.value)) {
                                    plain += '\\u' + one.value + two.value + three.value + four.value;
                                }
                                else {
                                    try {
                                        plain += JSON.parse('"\\u' + one.value + two.value + three.value + four.value + '"');
                                    }
                                    catch {
                                        // Something went wrong even though it looked like a valid hex value.
                                        plain += '\\u' + one.value + two.value + three.value + four.value;
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    plain += cur.value;
                }
            }
            else {
                plain += cur.value;
            }
        }

        return plain;
    }


    isHexDigit(char: string): boolean {
        return char === '0' ||
            char === '1' ||
            char === '2' ||
            char === '3' ||
            char === '4' ||
            char === '5' ||
            char === '6' ||
            char === '7' ||
            char === '8' ||
            char === '9' ||
            char === 'A' ||
            char === 'B' ||
            char === 'C' ||
            char === 'D' ||
            char === 'E' ||
            char === 'F' ||
            char === 'a' ||
            char === 'b' ||
            char === 'c' ||
            char === 'd' ||
            char === 'e' ||
            char === 'f';
    }
}

export default JsonTools;