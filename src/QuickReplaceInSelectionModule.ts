import { QuickReplaceInSelectionConfig } from './QuickReplaceInSelectionConfig';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { QuickReplaceInSelectionByRuleCommand } from './QuickReplaceInSelectionByRuleCommand';

export class QuickReplaceInSelectionModule {
  private _config : QuickReplaceInSelectionConfig;
  private _quickReplaceCommand : QuickReplaceInSelectionCommand;
  private _replaceByRuleCommand : QuickReplaceInSelectionByRuleCommand;

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
}