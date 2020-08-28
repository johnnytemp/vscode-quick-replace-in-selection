import { TextEditor, Selection } from 'vscode';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

/**
 * SelectUpToNextExprFromCursorsCommand class
 */
export class SelectUpToNextExprFromCursorsCommand extends SelectMatchesCommandBase {

  public getMethodName() : string {
    return 'Up To Next Matches From Cursors';
  }

  public computeSelection(editor: TextEditor, selections: Selection[], newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    let { error, options, regexp, document } = this.parseOptionsAndBuildRegexes(editor, target, outInfo, flags);
    if (error || !regexp) {
      return error;
    }
    let { nthOccurrence, movedNextFlag } = this.extractCommonOptions(options);
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
      regexp.lastIndex = document.offsetAt(selection.end);
      let searchStart = regexp.lastIndex;
      let minPosOkForInitialMove = searchStart + (selection.isEmpty ? 1 : 0); // if selection isn't empty, next match starting from selection.end is still moved. Otherwise, next match must be starting from beyond selection.end
      let n = 0;
      let remain = nthOccurrence;
      while ((arrMatch = regexp.exec(source))) {
        if (!movedNextFlag || arrMatch.index > minPosOkForInitialMove) { // either no need moved or moved, from first disallowed search position
          if (remain > 0) {
            --remain;
          }
          if (remain === 0) {
            let offsetStart = (arrMatch.index || 0) + this.getCaptureGroupLength(arrMatch, options.skipGroup);
            let offsetEnd = offsetStart + this.getCaptureGroupLength(arrMatch, options.selectGroup);
            let newSelection = new Selection(selection.start, document.positionAt(offsetEnd));
            newSelections.push(newSelection);
            break;
          }
        }
        if (regexp.lastIndex === searchStart) { // avoid searching stick at same position
          regexp.lastIndex += source.substr(searchStart, 2) === "\r\n" ? 2 : 1;
        }
        searchStart = regexp.lastIndex;
      }
    }
    return null;
  }
}
