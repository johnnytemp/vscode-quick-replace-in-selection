import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
// import { window, TextEditor, TextDocument, Selection, Position, Range, EndOfLine } from 'vscode';

export class QuickReplaceInSelectionByRuleCommand extends QuickReplaceInSelectionCommand {

  public performCommand() {
    /* window.showInputBox({
      placeHolder: 'Target to replace (regex)',
      value: QuickReplaceInSelectionCommand.lastTarget
    }).then((target: string | undefined) => {
      if (target !== undefined) {
        window.showInputBox({
          placeHolder: 'Replace to',
          value: QuickReplaceInSelectionCommand.lastReplacement
        }).then((replacement: string | undefined) => {
          if (replacement !== undefined) {
            this.performReplacement([target], [replacement], false);
          }
        })
      }
    }); */
    let module = QuickReplaceInSelectionModule.getInstance();

    let rules = module.getConfig().getRules();

    let rule : { [key: string] : any } = {};
    for (let key in rules) {  // only to get first rule for test
      rule = rules[key];
      break;
    }

    this.performReplacement(rule.find || [], rule.replace || [], true, false);
  }

}
