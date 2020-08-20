import { SelectMatchesOrAdjustSelectionConfig } from './SelectMatchesOrAdjustSelectionConfig';
import { SelectExprInSelectionCommand } from './SelectExprInSelectionCommand';
import { SelectNextExprFromCursorsCommand } from './SelectNextExprFromCursorsCommand';
import { SelectUpToNextExprFromCursorsCommand } from './SelectUpToNextExprFromCursorsCommand';
import { SelectExprInSelectionByPatternCommand } from './SelectExprInSelectionByPatternCommand';

export class SelectMatchesOrAdjustSelectionModule {
  private _config : SelectMatchesOrAdjustSelectionConfig;
  // private _repeatLastCommand : QuickReplaceInSelectionRepeatLastCommand;
  private _lastSelectCommand : SelectExprInSelectionCommand | null = null;
  private _selectExprInSelectionCommand : SelectExprInSelectionCommand;
  private _selectNextExprFromCursorsCommand : SelectNextExprFromCursorsCommand;
  private _selectUpToNextExprFromCursorsCommand : SelectUpToNextExprFromCursorsCommand;
  private _selectExprInSelectionByPatternCommand : SelectExprInSelectionByPatternCommand;

  private static _instance : SelectMatchesOrAdjustSelectionModule | undefined;

  public static getInstance() : SelectMatchesOrAdjustSelectionModule {
    if (SelectMatchesOrAdjustSelectionModule._instance === undefined) {
      SelectMatchesOrAdjustSelectionModule._instance = new SelectMatchesOrAdjustSelectionModule();
    }
    return SelectMatchesOrAdjustSelectionModule._instance;
  }

  private constructor() {
    this._config = new SelectMatchesOrAdjustSelectionConfig();
    // this._repeatLastCommand = new QuickReplaceInSelectionRepeatLastCommand();
    this._selectExprInSelectionCommand = new SelectExprInSelectionCommand();
    this._selectNextExprFromCursorsCommand = new SelectNextExprFromCursorsCommand();
    this._selectUpToNextExprFromCursorsCommand = new SelectUpToNextExprFromCursorsCommand();
    this._selectExprInSelectionByPatternCommand = new SelectExprInSelectionByPatternCommand();
  }

  public getConfig() : SelectMatchesOrAdjustSelectionConfig {
    return this._config;
  }

  /* public getRepeatLastCommand() : QuickReplaceInSelectionRepeatLastCommand {
    return this._repeatLastCommand;
  } */

  public getLastSelectCommand() : SelectExprInSelectionCommand | null {
    return this._lastSelectCommand;
  }

  public setLastSelectCommand(command : SelectExprInSelectionCommand | null) {
    this._lastSelectCommand = command;
  }

  public getSelectInSelectionCommand() : SelectExprInSelectionCommand {
    return this._selectExprInSelectionCommand;
  }

  public getSelectNextExCommand() : SelectNextExprFromCursorsCommand {
    return this._selectNextExprFromCursorsCommand;
  }

  public getSelectUpToNextExCommand() : SelectUpToNextExprFromCursorsCommand {
    return this._selectUpToNextExprFromCursorsCommand;
  }

  public getSelectInSelectionByPatternCommand() : SelectExprInSelectionCommand {
    return this._selectExprInSelectionByPatternCommand;
  }

  public clearHistory() {
    this.getSelectInSelectionCommand().clearHistory();
    this.setLastSelectCommand(null);
  }
}
