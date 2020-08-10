import { QuickReplaceInSelectionConfig } from './QuickReplaceInSelectionConfig';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { QuickReplaceInSelectionByRuleCommand } from './QuickReplaceInSelectionByRuleCommand';
import { QuickReplaceInSelectionRepeatLastCommand } from './QuickReplaceInSelectionRepeatLastCommand';

export class QuickReplaceInSelectionModule {
  private _config : QuickReplaceInSelectionConfig;
  private _quickReplaceCommand : QuickReplaceInSelectionCommand;
  private _replaceByRuleCommand : QuickReplaceInSelectionByRuleCommand;
  private _repeatLastCommand : QuickReplaceInSelectionRepeatLastCommand;
  private _lastCommand : QuickReplaceInSelectionCommand | null = null;

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

  public getLastCommand() : QuickReplaceInSelectionCommand | null {
    return this._lastCommand;
  }

  public setLastCommand(command : QuickReplaceInSelectionCommand | null) {
    this._lastCommand = command;
  }

  public clearHistory() {
    this.getQuickReplaceCommand().clearHistory();
    this.getReplaceByRuleCommand().clearHistory();
  }
}
