import { decode, encode } from 'html-entities';
import * as vscode from 'vscode';
import VSCodeTextTools from './tools';

class EncodeDecodeTools extends VSCodeTextTools {

    /**
     * Register commands
     */
    init(context: vscode.ExtensionContext): void {
        const commands: { [key: string]: string } = {
            tobase64: 'base64Encode',
            decodebase64: 'base64Decode',
            urlencode: 'urlEncode',
            urldecode: 'urlDecode',
            encodehtml: 'htmlEncode',
            decodehtml: 'htmlDecode',
            encodespaces: 'spacesEncode',
            decodespaces: 'spacesDecode',
            htmlasciitodecimal: 'htmlAsciiToDecimal',
            asciitodecimal: 'asciiToDecimal',
            asciitohex: 'asciiToHex',
            texttobinary: 'textToBinary',
            binarytotext: 'binaryToText',
            rot13: 'rot13',
            stripslashes: 'stripSlashes',
            addslashes: 'addSlashes',
            smartquotes: 'smartQuotes',
            straightenquotes: 'straightenQuotes',
            quotessingletodouble: 'quotesSingleToDouble',
            quotessingletobackticks: 'quotesSingleToBackticks',
            quotesdoubletosingle: 'quotesDoubleToSingle',
            quotesdoubletobackticks: 'quotesDoubleToBackticks'
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
     * Base 64 encode
     */
    base64Encode(text: string): string {
        return btoa(text);
    }

    /**
     * Base 64 decode
     */
    base64Decode(text: string): string {
        return atob(text);
    }

    /**
     * URL encode
     */
    urlEncode(text: string): string {
        return encodeURIComponent(text);
    }

    /**
     * URL decode
     */
    urlDecode(text: string): string {
        return decodeURIComponent(text);
    }

    /**
     * Spaces encode
     */
    spacesEncode(text: string): string {
        return text.replace(/ /g, '%20');
    }

    /**
     * Spaces decode
     */
    spacesDecode(text: string): string {
        return text.replace(/%20/g, ' ');
    }

    /**
     * Spaces encode
     */
    htmlEncode(text: string): string {
        return encode(text);
    }

    /**
     * Spaces decode
     */
    htmlDecode(text: string): string {
        return decode(text);
    }

    /**
     * Get the decimal value of an ASCII character
     */
    asciiToDecimal(text: string, fn: Function | null = null): string {
        let encoded = [];
        for (const letter of text) {
            let decimal = Number(letter.charCodeAt(0).toString(10));

            if (fn) {
                decimal = fn(decimal);
            }

            encoded.push(decimal);
        }

        return encoded.join(' ');
    }

    /**
     * HTML ASCII to decimal
     */
    htmlAsciiToDecimal(text: string): string {
        let encoded = this.asciiToDecimal(text, (decimal: number | string) => {
            decimal = decimal < 100 ? '0' + decimal : decimal;
            return '&#' + decimal + ';';
        });

        return encoded.replace(/ /g, '');
    }

    /**
     * ASCII to Hex (bytes)
     */
    asciiToHex(text: string): string {
        let encoded: string[] = [];
        for (const letter of text) {
            encoded.push(Number(letter.charCodeAt(0)).toString(16));
        }

        return encoded.join(' ').toUpperCase();
    }

    /**
     * Text to binary
     */
    textToBinary(text: string): string {
        let binary = [];
        for (const letter of text) {
            binary.push(toBinary(letter.charCodeAt(0)));
        }
        return binary.join(' ');
    }

    /**
     * Text to binary
     */
    binaryToText(text: string): string {
        let string: string[] = [];
        text.split(' ').forEach((binary) => {
            string.push(fromBinary(binary));
        });

        return string.join('');
    }

    /**
     * ROT13
     */
    rot13(text: string): string {
        return text.replace(/[a-zA-Z]/g, function (c) {
            let charCode: string | number = c;
            return String.fromCharCode((charCode <= 'Z' ? 90 : 122) >= (charCode = charCode.charCodeAt(0) + 13) ? Number(charCode) : Number(charCode) - 26);
        });
    }


    /**
     * Strip Slashes
     */
    stripSlashes(text: string): string {
        return text.replace(/\\/g, '');
    }

    /**
     * Add Slashes
     */
    addSlashes(text: string): string {
        return text.replace(/'|\\'/g, "\\'").replace(/"|\\"/g, '\\"'); //eslint-disable-line
    }

    /**
     * Smart Punctuation
     */
    smartQuotes(text: string): string {
        return text
            .replace(/(^|[-\u2014\s(\["])'/g, '$1\u2018')
            .replace(/'/g, '\u2019')
            .replace(/(^|[-\u2014/\[(\u2018\s])"/g, '$1\u201c')
            .replace(/"/g, '\u201d')
            .replace(/--/g, '\u2014');
    }

    /**
     * Straighten Quotes
     */
    straightenQuotes(text: string): string {
        return text
            .replace(/[\u2018\u2019]/g, "'") // eslint-disable-line
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/[\u2026]/g, '...');
    }

    /**
     * Single to double quotes
     */
    quotesSingleToDouble(text: string): string {
        return quotesTransform(text, "'", '"'); //eslint-disable-line
    }

    /**
     * Single to double quotes
     */
    quotesSingleToBackticks(text: string): string {
        return quotesTransform(text, "'", '`'); //eslint-disable-line
    }

    /**
     * Double quotes to single quotes
     */
    quotesDoubleToSingle(text: string): string {
        return quotesTransform(text, '"', "'"); //eslint-disable-line
    }

    /**
     * Double quotes to backticks
     */
    quotesDoubleToBackticks(text: string): string {
        return quotesTransform(text, '"', '`');
    }
}


/**
 * To Binary
 *
 * @param {string} n
 */
function toBinary(n: number): string {
    let value = convertToBinary(n);
    let length = value.length;
    while (length < 8) {
        value = '0' + value;
        length++;
    }
    return value;
}

/**
 * From Binary
 *
 * @param {string} binary
 * @return {string}
 */
function fromBinary(binary: string) {
    let out = '';
    while (binary.length >= 8) {
        var byte = binary.slice(0, 8);
        binary = binary.slice(8);
        out += String.fromCharCode(parseInt(byte, 2));
    }

    return decodeURIComponent(escape(out));
}


function convertToBinary(n: number): string {
    if (n <= 1) {
        return String(n);
    } else {
        return convertToBinary(Math.floor(n / 2)) + String(n % 2);
    }
}


function escape(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Quote Transform
 * convert quotes
 *
 * @param {string} input
 * @param {string} toChange
 * @param {string} changeTo
 */
function quotesTransform(input: string, toChange: string, changeTo: string) {
    let result = '';
    let isBetweenQuotes = false;
    let quoteCharacter;

    for (let index = 0; index < input.length; index++) {
        const current = input[index];
        const next = input[index + 1];

        // Found double-quote or single-quote
        // eslint-disable-next-line
        if (current === '"' || current === "'") {
            //eslint-disable-line
            // If not processing in between quotes
            if (!isBetweenQuotes) {
                quoteCharacter = current;
                isBetweenQuotes = true;
                result += changeTo;
            } else if (quoteCharacter === current) {
                // If processing between quotes, close quotes
                result += changeTo;
                isBetweenQuotes = false;
            } else {
                // Still inside quotes
                result += '\\' + changeTo;
            }
        } else if (current === '\\' && (next === "'" || next === '"')) {
            // If escape character is found and double or single quote after
            // Escape + quote to change to
            if (next === changeTo) {
                // If in between quotes and quote is equal to changeTo only escape once
                result += isBetweenQuotes && quoteCharacter === changeTo ? '\\' + changeTo : '\\\\' + changeTo;
                index++;
            } else if (next === toChange) {
                // Escape + quote to be changed
                // If between quotes can mantain to change
                result += isBetweenQuotes ? toChange : changeTo;
                index++;
            } else {
                result += current;
            }
        } else if (current === '\\' && next === '\\') {
            // Don't touch backslashes
            result += '\\\\';
            index++;
        } else {
            result += current;
        }
    }

    return result;
}

export default EncodeDecodeTools;