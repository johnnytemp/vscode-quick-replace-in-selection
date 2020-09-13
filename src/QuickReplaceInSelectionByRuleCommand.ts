import { QuickReplaceRule } from './QuickReplaceInSelectionConfig';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { IRepeatableCommand } from './RepeatableCommand';
import { window } from 'vscode';

export class QuickReplaceInSelectionByRuleCommand extends QuickReplaceInSelectionCommand {
  private _lastRuleName : string = '';

  public getCommandType() : string {
    return 'rule';
  }

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.ruleName !== undefined) {
      this.performRule(args.ruleName);
    } else {
      this.performCommand();
    }
  }

  public performCommand() {
    let module = this.getModule();

    let rules = module.getConfig().getRules();
    let lastRuleName = this.getLastRuleName();

    let ruleNames = [];
    if (lastRuleName !== '') {
      ruleNames.push('( Last Rule: ' + lastRuleName + ' )');
    }
    ruleNames.push('( Input Expressions... )');
    ruleNames = ruleNames.concat(Object.keys(rules));

    window.showQuickPick(ruleNames, {
      placeHolder: 'Choose Quick Replace Rule or Esc to cancel...'
    }).then((ruleName : string | undefined) => {
      if (ruleName === undefined) {
        return;
      }
      if (ruleName.startsWith('( Last Rule: ')) {
        ruleName = lastRuleName;
      } else if (ruleName === '( Input Expressions... )') {
        this.setLastRuleName(''); // also clear last rule, so that '( Input Expressions... )' is the first item for faster re-run.
        if (module.getLastCommand() === this) {
          module.setLastCommand(null);  // clear because last rule name is cleared. However, now the last command is copied at setLastCommand() if "repeatCommandUseCache" is true, and so this never occur in such case.
        }
        module.getQuickReplaceCommand().performCommand();
        return;
      } else {
        this.setLastRuleName(ruleName);
      }
      module.setLastCommand(this);
      this.handleError(this.performRule(ruleName));
    });
  }

  public repeatCommand() {
    this.handleError(this.performRule(this.getLastRuleName()));
  }

  //==== implementation methods ====

  public haveEscapesInReplace() : boolean {
    return false;
  }

  public getFlagsFromRule(rule : QuickReplaceRule) : string {
    return this.getFlagsFromFlagsString(rule.flags || '');
  }

  private lookupRule(ruleName : string) : QuickReplaceRule | undefined {
    let rules = this.getModule().getConfig().getRules();
    return rules[ruleName];
  }

  public performRule(ruleName : string) : string | null {
    let rule = this.lookupRule(ruleName);
    if (!rule) {
      return 'No such rule - ' + ruleName;
    }
    return this.performReplacement(rule.find || [], rule.replace || [], this.getFlagsFromRule(rule));
  }

  // for unit tests
  public computeReplacementsWithRule(ruleName: string, isCRLF : boolean, numSelections : number, selectionGetter : (i: number) => string, texts? : string[]) : string | string[] {
    let rule = this.lookupRule(ruleName);
    if (!rule) {
      return 'No such rule - ' + ruleName;
    }
    texts = texts || [];
    let error = this.computeReplacements(rule.find, rule.replace, isCRLF, numSelections, selectionGetter, texts, this.getFlagsFromRule(rule));
    return error !== null ? error : texts;
  }

  public clearHistory() {
    this._lastRuleName = '';
  }

  public getLastRuleName() {
    return this._lastRuleName;
  }

  public setLastRuleName(name : string) {
    this._lastRuleName = name;
  }

}
