import { window } from 'vscode';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

export class SelectMatchesRepeatLastCommand extends SelectMatchesCommandBase {
  public performCommand() {
    let lastCommand = this.getModule().getLastSelectCommand();
    if (lastCommand) {
      lastCommand.repeatCommand();
    } else {
      window.showInformationMessage('No last command to repeat');
    }
  }
}
