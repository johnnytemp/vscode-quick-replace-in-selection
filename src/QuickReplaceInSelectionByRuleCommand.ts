import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { window, QuickPickItem } from 'vscode';

export class QuickReplaceInSelectionByRuleCommand extends QuickReplaceInSelectionCommand {
  private static lastRuleName : string = '';

  public performCommand() {
    let module = QuickReplaceInSelectionModule.getInstance();

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
        module.getQuickReplaceCommand().performCommand();
        return;
      } else {
        QuickReplaceInSelectionByRuleCommand.lastRuleName = ruleName;
      }
      this.performRule(ruleName);
    });
  }

  public performRule(ruleName : string) {
    let rules = QuickReplaceInSelectionModule.getInstance().getConfig().getRules();
    let rule = rules[ruleName];
    this.performReplacement(rule.find || [], rule.replace || [], true, false);
  }

  public clearHistory() {
    QuickReplaceInSelectionByRuleCommand.lastRuleName = '';
  }

  public static getLastRuleName() {
    return QuickReplaceInSelectionByRuleCommand.lastRuleName;
  }

}
