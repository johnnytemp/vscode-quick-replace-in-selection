// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SelectMatchesOrAdjustSelectionModule } from './SelectMatchesOrAdjustSelectionModule';

var module = SelectMatchesOrAdjustSelectionModule.getInstance();

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
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.selectMatchesInSelection', (args?: {}) => {
    module.getSelectInSelectionCommand().performCommandWithArgs(args);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.selectNextMatchesFromCursors', (args?: {}) => {
    module.getSelectNextExCommand().performCommandWithArgs(args);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.selectUpToNextMatchesFromCursors', (args?: {}) => {
    module.getSelectUpToNextExCommand().performCommandWithArgs(args);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.unselectSurroundingWhitespaces', () => {
    module.getSelectInSelectionCommand().performCommandWithArgs({
      target: "\\S+(\\s+\\S+)*"
    });
  }));
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.normalizeSelection', () => {
    module.getSelectInSelectionCommand().performCommandWithArgs({
      target: "?{1,2}?s-g (\\s*)(.*\\S)?"
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.selectMatchesInSelectionByPattern', (args?: {}) => {
    module.getSelectMatchesByPatternCommand('selectMatchesInSelection').performCommandWithArgs(args);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.selectNextMatchesFromCursorsByPattern', (args?: {}) => {
    module.getSelectMatchesByPatternCommand('selectNextMatchesFromCursors').performCommandWithArgs(args);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('selectMatchesOrAdjustSelection.selectUpToNextMatchesFromCursorsByPattern', (args?: {}) => {
    module.getSelectMatchesByPatternCommand('selectUpToNextMatchesFromCursors').performCommandWithArgs(args);
  }));
}

// this method is called when your extension is deactivated
export function deactivate() {
  module.clearHistory();
}
