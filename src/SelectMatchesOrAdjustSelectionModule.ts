import { SelectMatchesOrAdjustSelectionConfig } from './SelectMatchesOrAdjustSelectionConfig';
import { SelectExprInSelectionCommand } from './SelectExprInSelectionCommand';
import { SelectNextExprFromCursorsCommand } from './SelectNextExprFromCursorsCommand';
import { SelectUpToNextExprFromCursorsCommand } from './SelectUpToNextExprFromCursorsCommand';
import { SelectMatchesByPatternCommand } from './SelectMatchesByPatternCommand';

export class SelectMatchesOrAdjustSelectionModule {
  private _config : SelectMatchesOrAdjustSelectionConfig;
  // private _repeatLastCommand : QuickReplaceInSelectionRepeatLastCommand;
  private _lastSelectCommand : SelectExprInSelectionCommand | null = null;
  private _selectExprInSelectionCommand : SelectExprInSelectionCommand;
  private _selectNextExprFromCursorsCommand : SelectNextExprFromCursorsCommand;
  private _selectUpToNextExprFromCursorsCommand : SelectUpToNextExprFromCursorsCommand;
  private _selectMatchesByPatternCommand : SelectMatchesByPatternCommand;
  private _selectMatchesByPatternCommands : { [id: string]: SelectMatchesByPatternCommand };

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
    this._selectMatchesByPatternCommand = new SelectMatchesByPatternCommand();
    this._selectMatchesByPatternCommands = {};
    this._selectMatchesByPatternCommands['selectMatchesInSelection'] = new SelectMatchesByPatternCommand(this._selectExprInSelectionCommand);
    this._selectMatchesByPatternCommands['selectNextMatchesFromCursors'] = new SelectMatchesByPatternCommand(this._selectNextExprFromCursorsCommand);
    this._selectMatchesByPatternCommands['selectUpToNextMatchesFromCursors'] = new SelectMatchesByPatternCommand(this._selectUpToNextExprFromCursorsCommand);
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

  public getSelectMatchesByPatternCommand(commandId?: string) : SelectMatchesByPatternCommand {
    if (commandId !== undefined) {
      return this._selectMatchesByPatternCommands[commandId];
    }
    return this._selectMatchesByPatternCommand;
  }

  public clearHistory() {
    this.getSelectInSelectionCommand().clearHistory();
    this.setLastSelectCommand(null);
  }
}
