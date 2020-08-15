import { window, TextEditor, TextDocument, Selection, Position, Range, EndOfLine } from 'vscode';
import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { QuickSelectInSelectionCommand } from './QuickSelectInSelectionCommand';
import * as helper from './helper';

/**
 * QuickSelectFirstFromCursorsCommand class
 */
export class QuickSelectFirstFromCursorsCommand extends QuickSelectInSelectionCommand {

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, flags?: string) : string | null {
    if (target === '') {
      return null;
    }
    let inOutTarget = { ref: target };
    let groupsInfo = this.parseSkipGroupAndSelectGroupForSelectFromSearchTarget(inOutTarget);
    target = inOutTarget.ref;
    let regexps: RegExp[] = [];
    let err = this.buildRegexes(regexps, [target], { ref: null}, flags, true);
    if (err !== null) {
      return err;
    }
    // let hasGlobalFlag = regexps[0].global;
    let regexp : RegExp = regexps[0];
    let document = editor.document;
    let selections = editor.selections;
    /* let numSelections = selections.length;
    let isUseWholeDocumentSelection = numSelections <= 1 && (numSelections === 0 || selections[0].isEmpty);
    if (isUseWholeDocumentSelection) {
      selections = [helper.getWholeDocumentSelection(document)];
      numSelections = 1;
    } */
    let source = document.getText();
    for (let selection of selections) {
      let arrMatch : RegExpExecArray | null;
      let searchStart = regexp.lastIndex = document.offsetAt(selection.end);
      let n = 0;
      while ((arrMatch = regexp.exec(source))) {
        let offsetStart = (arrMatch.index || 0) + this.getCaptureGroupLength(arrMatch, groupsInfo.skip);
        let offsetEnd = offsetStart + this.getCaptureGroupLength(arrMatch, groupsInfo.select);
        let newSelection = new Selection(document.positionAt(offsetStart), document.positionAt(offsetEnd));
        newSelections.push(newSelection);
        break;
        /* if (!hasGlobalFlag) {
          break;
        }
        if (offsetEnd === offsetStart && regexp.lastIndex === searchStart) { // avoid searching stick at same position
          regexp.lastIndex += 1;
        }
        searchStart = regexp.lastIndex; */
      }
    }
    return null;
  }
}
