// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';

var module = QuickReplaceInSelectionModule.getInstance();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "quick-replace-in-selection" is now active!');

  // let replaceInSelection = new QuickReplaceInSelectionCommand();
  module.getConfig().reloadConfig();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('quick-replace-in-selection.replaceInSelection', () => {
    // The code you place here will be executed every time your command is executed

    // // Display a message box to the user
    // vscode.window.showInformationMessage('Hello World from Quick Replace In Selection!');
    module.getQuickReplaceCommand().performCommand();
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('quick-replace-in-selection.replaceInSelectionByRule', () => {
    module.getReplaceByRuleCommand().performCommand();
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  module.clearHistory();
}
