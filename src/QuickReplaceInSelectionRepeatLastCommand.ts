import { QuickReplaceInSelectionCommand } from './QuickReplaceInSelectionCommand';
import { window } from 'vscode';

export class QuickReplaceInSelectionRepeatLastCommand extends QuickReplaceInSelectionCommand {
  public performCommand() {
    let lastCommand = this.getModule().getLastCommand();
    if (lastCommand) {
      lastCommand.repeatCommand();
    } else {
      window.showInformationMessage('No last command to repeat');
    }
  }
}
