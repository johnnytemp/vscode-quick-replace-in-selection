import { TextEditor, Selection } from 'vscode';
import { SelectExprInSelectionCommand } from './SelectExprInSelectionCommand';

/**
 * SelectUpToNextExprFromCursorsCommand class
 */
export class SelectUpToNextExprFromCursorsCommand extends SelectExprInSelectionCommand {

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    let { error, groupsInfo, regexp, document, selections } = this.parseGroupsInfoAndBuildRegexes(editor, target, outInfo, flags);
    if (error || !regexp) {
      return error;
    }
    // let hasGlobalFlag = regexp.global;
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
        let newSelection = new Selection(selection.start, document.positionAt(offsetEnd));
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
