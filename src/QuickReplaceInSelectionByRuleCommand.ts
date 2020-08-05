import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { window, QuickPickItem } from 'vscode';

export class QuickReplaceInSelectionByRuleCommand extends QuickReplaceInSelectionCommand {

  public performCommand() {
    let module = QuickReplaceInSelectionModule.getInstance();

    let rules = module.getConfig().getRules();
    let ruleNames = Object.keys(rules);
    window.showQuickPick(ruleNames, {
      placeHolder: 'Choose Quick Replace Rule... or Esc to cancel'
    }).then((ruleName : string | undefined) => {
      if (ruleName === undefined)
        return;
      let rule = rules[ruleName];
      this.performReplacement(rule.find || [], rule.replace || [], true, false);
    });
  }

}
