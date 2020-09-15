import { ExtensionContext, commands } from 'vscode';
import { QuickReplaceInSelectionConfig } from './QuickReplaceInSelectionConfig';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { QuickReplaceInSelectionByRuleCommand } from './QuickReplaceInSelectionByRuleCommand';
import { QuickReplaceSelectionsCommand } from "./QuickReplaceSelectionsCommand";
import { QuickReplaceInSelectionRepeatLastCommand } from './QuickReplaceInSelectionRepeatLastCommand';
import { IRepeatableCommand } from './RepeatableCommand';

export class QuickReplaceInSelectionModule {
  private _config : QuickReplaceInSelectionConfig;
  private _quickReplaceCommand : QuickReplaceInSelectionCommand;
  private _replaceByRuleCommand : QuickReplaceInSelectionByRuleCommand;
  private _replaceSelectionsCommand : QuickReplaceSelectionsCommand;
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
    this._replaceSelectionsCommand = new QuickReplaceSelectionsCommand();
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

  public getReplaceSelectionsCommand() : QuickReplaceSelectionsCommand {
    return this._replaceSelectionsCommand;
  }

  public getRepeatLastCommand() : QuickReplaceInSelectionRepeatLastCommand {
    return this._repeatLastCommand;
  }

  public getLastCommand() : IRepeatableCommand | null {
    return this._lastCommand;
  }

  public setLastCommand(command : IRepeatableCommand | null) {
    if (command && this._config.getRepeatCommandUseCache()) {
      this._lastCommand = command.clone();
    } else {
      this._lastCommand = command;
    }
  }

  public clearHistory() {
    this.getQuickReplaceCommand().clearHistory();
    this.getReplaceByRuleCommand().clearHistory();
    this.getReplaceSelectionsCommand().clearHistory();
    let lastCommand = this.getLastCommand();
    if (lastCommand) {
      lastCommand.clearHistory();
    }
    this.setLastCommand(null);
  }

  public onActivateExtension(context: ExtensionContext) {
    this.getConfig().reloadConfig();

    let disposable = commands.registerCommand('quickReplaceInSelection.replaceInSelection', (args?: {}) => {
      // The code you place here will be executed every time your command is executed

      // // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from Quick Replace In Selection!');
      this.getQuickReplaceCommand().performCommandWithArgs(args);
    });
    context.subscriptions.push(disposable);

    disposable = commands.registerCommand('quickReplaceInSelection.replaceInSelectionByRule', (args?: {}) => {
      this.getReplaceByRuleCommand().performCommandWithArgs(args);
    });
    context.subscriptions.push(disposable);

    disposable = commands.registerCommand('quickReplaceInSelection.replaceSelectionsTo', (args?: {}) => {
      this.getReplaceSelectionsCommand().performCommandWithArgs(args);
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
