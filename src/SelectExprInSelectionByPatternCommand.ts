import { window } from 'vscode';
import { SelectRule } from './SelectMatchesOrAdjustSelectionConfig';
import { SelectExprInSelectionCommand } from './SelectExprInSelectionCommand';

/**
 * SelectExprInSelectionByPatternCommand class
 */
export class SelectExprInSelectionByPatternCommand extends SelectExprInSelectionCommand {
  private static lastRuleName : string = '';

  public getCommandType() : string {
    return 'rule';
  }

  protected allowSpecialPrefixInRegex() {
    return true;
  }

  protected getLastSelectRuleName() {
    return SelectExprInSelectionByPatternCommand.lastRuleName;
  }

  protected setLastSelectRuleName(name: string) {
    SelectExprInSelectionByPatternCommand.lastRuleName = name;
  }

  public clearHistory() {
    this.setLastSelectRuleName('');
  }

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.pattern !== undefined) {
      this.handleError(this.performSelection(args.pattern, this.addDefaultFlags(), true));
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
        module.getSelectInSelectionCommand().performCommand();
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
    return this.performSelection(rule.find || '', this.getFlagsFromRule(rule), isByArgs);
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
