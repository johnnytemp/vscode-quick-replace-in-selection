import { window } from 'vscode';
import { SelectRule } from './SelectMatchesOrAdjustSelectionConfig';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

/**
 * SelectMatchesByPatternCommand class
 */
export class SelectMatchesByPatternCommand extends SelectMatchesCommandBase {
  private static lastRuleName : string = '';
  private _lastPatternSelectMethod : SelectMatchesCommandBase | null;
  private _underlyingCommand : SelectMatchesCommandBase | undefined;

  public constructor(command?: SelectMatchesCommandBase) {
    super();
    this._lastPatternSelectMethod = null;
    this._underlyingCommand = command;
  }

  protected getSelectMatchesCommand(args? : any) : SelectMatchesCommandBase {
    if (this._underlyingCommand) {
      return this._underlyingCommand;
    }
    let module = this.getModule();
    return module.getInputAndSelectCommandById(args.selectScope || '');
  }

  public getCommandType() : string {
    return 'rule';
  }

  protected allowSpecialPrefixInRegex() {
    return true;
  }

  protected getLastSelectRuleName() {
    return SelectMatchesByPatternCommand.lastRuleName;
  }

  protected setLastSelectRuleName(name: string) {
    SelectMatchesByPatternCommand.lastRuleName = name;
  }

  protected getLastPatternSelectMethod() : SelectMatchesCommandBase | null {
    return this._lastPatternSelectMethod;
  }

  protected setLastPatternSelectMethod(command : SelectMatchesCommandBase | null) {
    this._lastPatternSelectMethod = command;
  }

  public clearHistory() {
    this.setLastSelectRuleName('');
    this.setLastPatternSelectMethod(null);
  }

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.patternName !== undefined) {
      this.handleError(this.performSelectionWithRule(args.patternName, this.getSelectMatchesCommand(args), true));
      return;
    }
    this.performCommand();
  }

  public performCommand() {
    if (this._underlyingCommand !== undefined) {
      return this.performCommandWithSelectCommand(this._underlyingCommand);
    }
    let selectCommands = this.getModule().getAvailableInputAndSelectCommands();
    let lastSelectCommand = this.getLastPatternSelectMethod();
    if (lastSelectCommand) {
      let lastIndex = selectCommands.indexOf(lastSelectCommand);
      if (lastIndex !== -1) {
        selectCommands.splice(lastIndex, 1);
        selectCommands = [lastSelectCommand].concat(selectCommands);
      }
    }

    let commandsMap : { [name: string] : SelectMatchesCommandBase } = {};
    let methodNames = [];
    for (let command of selectCommands) {
      let name = command.getMethodName();
      methodNames.push(name);
      commandsMap[name] = command;
    }

    window.showQuickPick(methodNames, {
      placeHolder: 'Choose Select Scope or Esc to cancel...'
    }).then((methodName : string | undefined) => {
      if (methodName === undefined) {
        return;
      }
      let selectedCommand = commandsMap[methodName];
      this.setLastPatternSelectMethod(selectedCommand);
      this.performCommandWithSelectCommand(selectedCommand);
    });
  }

  public performCommandWithSelectCommand(selectMatchesCommand: SelectMatchesCommandBase) {
    let module = this.getModule();

    let rules = module.getConfig().getSelectRules();
    let lastRuleName = this.getLastSelectRuleName();

    let ruleNames = [];
    if (lastRuleName !== '') {
      ruleNames.push('( Last Pattern: ' + lastRuleName + ' )');
    }
    ruleNames.push('( Input Expressions )');
    ruleNames = ruleNames.concat(Object.keys(rules));

    window.showQuickPick(ruleNames, {
      placeHolder: 'Choose Pattern to Select or Esc to cancel...'
    }).then((ruleName : string | undefined) => {
      if (ruleName === undefined) {
        return;
      }
      if (ruleName.startsWith('( Last Pattern: ')) {
        ruleName = lastRuleName;
      } else if (ruleName === '( Input Expressions )') {
        this.setLastSelectRuleName(''); // also clear last rule, so that '( Input Expressions )' is the first item for faster re-run.
        module.setLastSelectCommand(null);
        selectMatchesCommand.performCommand();
        return;
      } else {
        this.setLastSelectRuleName(ruleName);
      }
      module.setLastSelectCommand(this);
      this.handleError(this.performSelectionWithRule(ruleName, selectMatchesCommand));
    });
  }

  public performSelectionWithRule(patternName: string, selectMatchesCommand : SelectMatchesCommandBase, isByArgs?: boolean) : string | null {
    let rule = this.lookupRule(patternName);
    if (!rule) {
      return 'No such pattern - ' + patternName;
    }
    return selectMatchesCommand.performSelection(rule.find || '', this.getFlagsFromRule(rule), isByArgs);
  }

  protected getFlagsFromRule(rule : SelectRule) : string {
    // return this.getFlagsFromFlagsString(rule.flags || '');
    return this.addDefaultFlags();
  }

  private lookupRule(ruleName : string) : SelectRule | undefined {
    let rules = this.getModule().getConfig().getSelectRules();
    return rules[ruleName];
  }

}
