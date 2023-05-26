import * as vscode from 'vscode';
import CaseTools from './case-tools';
import CounterTools from './counter-tools';
import EncodeDecodeTools from './encode-decode-tools';
import GenerateTools from './generate-tools';
import InsertTools from './insert-tools';
import JsonTools from './json-tools';
import LinesTools from './lines-tools';
import MiscTools from './misc-tools';

export function activate(context: vscode.ExtensionContext) {
	const caseTools = new CaseTools();
	const counterTools = new CounterTools();
	const encodeDecodeTools = new EncodeDecodeTools();
	const generateTools = new GenerateTools();
	const insertTools = new InsertTools();
	const jsonTools = new JsonTools();
	const linesTools = new LinesTools();
	const miscTools = new MiscTools();

	caseTools.init(context);
	counterTools.init(context);
	encodeDecodeTools.init(context);
	generateTools.init(context);
	insertTools.init(context);
	jsonTools.init(context);
	linesTools.init(context);
	miscTools.init(context);
}


export function deactivate() { }
