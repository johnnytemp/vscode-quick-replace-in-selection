import { ExtensionContext, commands } from 'vscode';
import { QuickReplaceInSelectionConfig } from './QuickReplaceInSelectionConfig';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { QuickReplaceInSelectionByRuleCommand } from './QuickReplaceInSelectionByRuleCommand';
import { QuickReplaceInSelectionRepeatLastCommand } from './QuickReplaceInSelectionRepeatLastCommand';
import { IRepeatableCommand } from './RepeatableCommand';

export class QuickReplaceInSelectionModule {
  private _config : QuickReplaceInSelectionConfig;
  private _quickReplaceCommand : QuickReplaceInSelectionCommand;
  private _replaceByRuleCommand : QuickReplaceInSelectionByRuleCommand;
  private _repeatLastCommand : QuickReplaceInSelectionRepeatLastCommand;
  private _lastCommand : IRepeatableCommand | null = null;

  private static _instance : QuickReplaceInSelectionModule | undefined;

  public static getInstance() : QuickReplaceInSelectionModule {
    if (QuickReplaceInSelectionModule._instance === undefined) {
      QuickReplaceInSelectionModule._instance = new QuickReplaceInSelectionModule();
    }
    return QuickReplaceInSelectionModule._instance;
  }

  private constructor() {
    this._config = new QuickReplaceInSelectionConfig();
    this._quickReplaceCommand = new QuickReplaceInSelectionCommand();
    this._replaceByRuleCommand = new QuickReplaceInSelectionByRuleCommand();
    this._repeatLastCommand = new QuickReplaceInSelectionRepeatLastCommand();
  }

  public getConfig() : QuickReplaceInSelectionConfig {
    return this._config;
  }

  public getQuickReplaceCommand() : QuickReplaceInSelectionCommand {
    return this._quickReplaceCommand;
  }

  public getReplaceByRuleCommand() : QuickReplaceInSelectionByRuleCommand {
    return this._replaceByRuleCommand;
  }

  public getRepeatLastCommand() : QuickReplaceInSelectionRepeatLastCommand {
    return this._repeatLastCommand;
  }

  public getLastCommand() : IRepeatableCommand | null {
    return this._lastCommand;
  }

  public setLastCommand(command : IRepeatableCommand | null) {
    this._lastCommand = command ? command.clone() : command;
  }

  public clearHistory() {
    this.getQuickReplaceCommand().clearHistory();
    this.getReplaceByRuleCommand().clearHistory();
    let lastCommand = this.getLastCommand();
    if (lastCommand) {
      lastCommand.clearHistory();
    }
    this.setLastCommand(null);
  }

  public onActivateExtension(context: ExtensionContext) {
    this.getConfig().reloadConfig();

    let disposable = commands.registerCommand('quickReplaceInSelection.replaceInSelection', () => {
      // The code you place here will be executed every time your command is executed

      // // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from Quick Replace In Selection!');
      this.getQuickReplaceCommand().performCommand();
    });
    context.subscriptions.push(disposable);

    disposable = commands.registerCommand('quickReplaceInSelection.replaceInSelectionByRule', (args?: {}) => {
      this.getReplaceByRuleCommand().performCommandWithArgs(args);
    });
    context.subscriptions.push(disposable);

    disposable = commands.registerCommand('quickReplaceInSelection.repeatLastReplace', () => {
      this.getRepeatLastCommand().performCommand();
    });
    context.subscriptions.push(disposable);
  }

  public onDeactivateExtension() {
    this.clearHistory();
  }
}
