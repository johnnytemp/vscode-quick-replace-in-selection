import { window, TextEditor, Selection } from 'vscode';
import { SelectMatchesOrAdjustSelectionModule } from './SelectMatchesOrAdjustSelectionModule';
import * as helper from './helper';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

/**
 * SelectExprInSelectionCommand class
 */
export class SelectExprInSelectionCommand extends SelectMatchesCommandBase {

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    let { error, options, regexp, document, selections } = this.parseOptionsAndBuildRegexes(editor, target, outInfo, flags);
    if (error || !regexp) {
      return error;
    }
    let hasGlobalFlag = regexp.global;
    let numSelections = selections.length;
    let isUseWholeDocumentSelection = numSelections <= 1 && (numSelections === 0 || selections[0].isEmpty);
    if (isUseWholeDocumentSelection) {
      selections = [helper.getWholeDocumentSelection(document)];
      numSelections = 1;
    }
    // let nMaxMatches = 50;
    for (let selection of selections) {
      let source = document.getText(selection);
      let arrMatch : RegExpExecArray | null;
      let searchStart = regexp.lastIndex = 0;
      let n = 0;
      while ((arrMatch = regexp.exec(source))) {
        let offsetStart = document.offsetAt(selection.start) + (arrMatch.index || 0) + this.getCaptureGroupLength(arrMatch, options.skipGroup);
        let offsetEnd = offsetStart + this.getCaptureGroupLength(arrMatch, options.selectGroup);
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
