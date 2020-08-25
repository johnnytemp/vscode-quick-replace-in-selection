import { TextEditor, TextDocument, Selection, Position } from 'vscode';
import * as helper from './helper';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

/**
 * SelectExprInLineSelectionsCommand class
 */
export class SelectExprInLineSelectionsCommand extends SelectMatchesCommandBase {

  public getMethodName() : string {
    return 'Matches In Line Selections';
  }

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    let { error, options, regexp, document, selections } = this.parseOptionsAndBuildRegexes(editor, target, outInfo, flags);
    if (error || !regexp) {
      return error;
    }
    let nthOccurrence = this.getNthOccurrenceFromOptions(options);
    let shouldMatchOnce = !regexp.global || nthOccurrence !== 0;
    let numSelections = selections.length;
    let isUseWholeDocumentSelection = numSelections <= 1 && (numSelections === 0 || selections[0].isEmpty);
    if (isUseWholeDocumentSelection) {
      selections = [helper.getWholeDocumentSelection(document)];
      numSelections = 1;
    }
    // let nMaxMatches = 50;
    let lineSelections: Selection[] = [];
    helper.splitSelectionToLineSelections(document, selections, lineSelections);
    for (let selection of lineSelections) {
      let source = document.getText(selection);
      let arrMatch : RegExpExecArray | null;
      regexp.lastIndex = 0;
      let searchStart = regexp.lastIndex;
      let n = 0;
      let remain = nthOccurrence;
      while ((arrMatch = regexp.exec(source))) {
        if (remain > 0) {
          --remain;
        }
        if (remain === 0) {
          let offsetStart = document.offsetAt(selection.start) + (arrMatch.index || 0) + this.getCaptureGroupLength(arrMatch, options.skipGroup);
          let offsetEnd = offsetStart + this.getCaptureGroupLength(arrMatch, options.selectGroup);
          let newSelection = new Selection(document.positionAt(offsetStart), document.positionAt(offsetEnd));
          newSelections.push(newSelection);
          if (shouldMatchOnce /* || ++n >= nMaxMatches */) {
            break;
          }
        }
        if (regexp.lastIndex === searchStart) { // avoid searching stick at same position
          regexp.lastIndex += 1;
        }
        searchStart = regexp.lastIndex;
      }
    }
    return null;
  }
}
