import { QuickReplaceRule } from './QuickReplaceInSelectionConfig';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { window } from 'vscode';

export class QuickReplaceInSelectionByRuleCommand extends QuickReplaceInSelectionCommand {
  private static lastRuleName : string = '';

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
    let lastRuleName = QuickReplaceInSelectionByRuleCommand.getLastRuleName();

    let ruleNames = [];
    if (lastRuleName !== '') {
      ruleNames.push('( Last Rule: ' + lastRuleName + ' )');
    }
    ruleNames.push('( Input Expressions )');
    ruleNames = ruleNames.concat(Object.keys(rules));

    window.showQuickPick(ruleNames, {
      placeHolder: 'Choose Quick Replace Rule or Esc to cancel...'
    }).then((ruleName : string | undefined) => {
      if (ruleName === undefined) {
        return;
      }
      if (ruleName.startsWith('( Last Rule: ')) {
        ruleName = lastRuleName;
      } else if (ruleName === '( Input Expressions )') {
        QuickReplaceInSelectionByRuleCommand.lastRuleName = ''; // also clear last rule, so that '( Input Expressions )' is the first item for faster re-run.
        module.setLastCommand(null);
        module.getQuickReplaceCommand().performCommand();
        return;
      } else {
        QuickReplaceInSelectionByRuleCommand.lastRuleName = ruleName;
      }
      module.setLastCommand(this);
      this.handleError(this.performRule(ruleName));
    });
  }

  public repeatCommand() {
    this.handleError(this.performRule(QuickReplaceInSelectionByRuleCommand.lastRuleName));
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
    QuickReplaceInSelectionByRuleCommand.lastRuleName = '';
  }

  public static getLastRuleName() {
    return QuickReplaceInSelectionByRuleCommand.lastRuleName;
  }

}
