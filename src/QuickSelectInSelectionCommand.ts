import { window, TextEditor, TextDocument, Selection, Position, Range, EndOfLine } from 'vscode';
import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { SearchOrReplaceCommandBase } from './SearchOrReplaceCommandBase';
import * as helper from './helper';

/**
 * QuickSelectInSelectionCommand class
 */
export class QuickSelectInSelectionCommand extends SearchOrReplaceCommandBase {
  static lastTarget : string = '';

  public getCommandType() : string {
    return 'input';
  }

  protected getModule() : QuickReplaceInSelectionModule {
    return QuickReplaceInSelectionModule.getInstance();
  }

  public clearHistory() {
    QuickSelectInSelectionCommand.lastTarget = '';
  }

  public performCommand() {
    window.showInputBox({
      placeHolder: 'Target to select (regex)',
      value: QuickSelectInSelectionCommand.lastTarget
    }).then((target: string | undefined) => {
      if (target !== undefined) {
        this.handleError(this.performSelection(target, this.addDefaultFlags()));
      }
    });
  }

  public performSelection(target: string, flags?: string) : string | null {
    if (this.getCommandType() === 'input') {
      QuickSelectInSelectionCommand.lastTarget = target;
    }
    let editor = window.activeTextEditor;
    if (!editor) {
      return 'No editor';
    }
    let newSelections: Selection[] = [];
    let error = this.computeSelection(editor, newSelections, target, flags);
    if (error === null && newSelections.length > 0) {
      console.log('Quick Select In Selection: ' + newSelections.length + " matches found in " + editor.selections.length + " selections.");
      editor.selections = newSelections;
      editor.revealRange(newSelections[0]);
    }
    return error;
  }

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, flags?: string) : string | null {
    if (target === '') {
      return null;
    }
    let regexps: RegExp[] = [];
    let err = this.buildRegexes(regexps, [target], { ref: null}, flags, true);
    if (err !== null) {
      return err;
    }
    let hasGlobalFlag = (flags || '').match('g') !== null;
    let regexp : RegExp = regexps[0];
    let document = editor.document;
    let selections = editor.selections;
    let numSelections = selections.length;
    let isUseWholeDocumentSelection = numSelections <= 1 && (numSelections === 0 || selections[0].isEmpty);
    if (isUseWholeDocumentSelection) {
      selections = [helper.getWholeDocumentSelection(document)];
      numSelections = 1;
    }
    // let nMaxMatches = 50;
    for (let selection of selections) {
      let source = document.getText(selection);
      let aMatch : RegExpExecArray | null;
      let searchStart = regexp.lastIndex = 0;
      let n = 0;
      while ((aMatch = regexp.exec(source))) {
        let offsetStart = document.offsetAt(selection.start) + (aMatch.index || 0);
        let offsetEnd = offsetStart + aMatch[0].length;
        let newSelection = new Selection(document.positionAt(offsetStart), document.positionAt(offsetEnd));
        newSelections.push(newSelection);
        if (!hasGlobalFlag /* || ++n >= nMaxMatches */) {
          break;
        }
        if (offsetEnd === offsetStart && regexp.lastIndex === searchStart) { // avoid searching stick at same position
          regexp.lastIndex += 1;
        }
        searchStart = regexp.lastIndex;
      }
    }
    return null;
  }
}
