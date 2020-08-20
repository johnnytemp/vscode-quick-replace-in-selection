import { window } from 'vscode';
import { SelectRule } from './SelectMatchesOrAdjustSelectionConfig';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

/**
 * SelectMatchesByPatternCommand class
 */
export class SelectMatchesByPatternCommand extends SelectMatchesCommandBase {
  private static lastRuleName : string = '';
  private _underlyingCommand : SelectMatchesCommandBase;

  public constructor(command: SelectMatchesCommandBase) {
    super();
    this._underlyingCommand = command;
  }

  protected getSelectMatchesCommand() : SelectMatchesCommandBase {
    return this._underlyingCommand;
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

  public clearHistory() {
    this.setLastSelectRuleName('');
  }

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.patternName !== undefined) {
      this.handleError(this.getSelectMatchesCommand().performSelection(args.patternName, this.addDefaultFlags(), true));
    } else {
      this.performCommand();
    }
  }

  public performCommand() {
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
        this.getSelectMatchesCommand().performCommand();
        return;
      } else {
        this.setLastSelectRuleName(ruleName);
      }
      module.setLastSelectCommand(this);
      this.handleError(this.performSelectionWithRule(ruleName));
    });
  }

  public performSelectionWithRule(patternName: string, isByArgs?: boolean) : string | null {
    let rule = this.lookupRule(patternName);
    if (!rule) {
      return 'No such pattern - ' + patternName;
    }
    return this.getSelectMatchesCommand().performSelection(rule.find || '', this.getFlagsFromRule(rule), isByArgs);
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
