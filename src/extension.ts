import * as vscode from "vscode";
import CaseTools from "./case-tools";
import CounterTools from "./counter-tools";
import EncodeDecodeTools from "./encode-decode-tools";
import GenerateTools from "./generate-tools";
import HashTools from "./hash-tools";
import InsertTools from "./insert-tools";
import JsonTools from "./json-tools";
import LinesTools from "./lines-tools";
import MiscTools from "./misc-tools";

export function activate(context: vscode.ExtensionContext) {
	const caseTools = new CaseTools(context);
	const counterTools = new CounterTools(context);
	const encodeDecodeTools = new EncodeDecodeTools(context);
	const generateTools = new GenerateTools(context);
	const hashTools = new HashTools(context);
	const insertTools = new InsertTools(context);
	const jsonTools = new JsonTools(context);
	const linesTools = new LinesTools(context);
	const miscTools = new MiscTools(context);

	caseTools.init();
	counterTools.init();
	encodeDecodeTools.init();
	generateTools.init();
	hashTools.init();
	insertTools.init();
	jsonTools.init();
	linesTools.init();
	miscTools.init();
}

export function deactivate() {}
