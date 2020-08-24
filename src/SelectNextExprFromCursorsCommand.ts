import { TextEditor, Selection } from 'vscode';
import { SelectMatchesCommandBase } from './SelectMatchesCommandBase';

/**
 * SelectNextExprFromCursorsCommand class
 */
export class SelectNextExprFromCursorsCommand extends SelectMatchesCommandBase {

  public getMethodName() : string {
    return 'Next Matches From Cursors';
  }

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    let { error, options, regexp, document, selections } = this.parseOptionsAndBuildRegexes(editor, target, outInfo, flags);
    if (error || !regexp) {
      return error;
    }
    let shouldExtendsIfNonEmptyAndContiguous = options.optionFlags.indexOf('e') !== -1;
    let nthOccurrence = parseInt(options.optionFlags);
    // let hasGlobalFlag = regexp.global;
    /* let numSelections = selections.length;
    let isUseWholeDocumentSelection = numSelections <= 1 && (numSelections === 0 || selections[0].isEmpty);
    if (isUseWholeDocumentSelection) {
      selections = [helper.getWholeDocumentSelection(document)];
      numSelections = 1;
    } */
    let source = document.getText();
    for (let selection of selections) {
      let shouldExtends = shouldExtendsIfNonEmptyAndContiguous && selection.start.isBefore(selection.end);
      let arrMatch : RegExpExecArray | null;
      regexp.lastIndex = document.offsetAt(selection.end);
      let searchStart = regexp.lastIndex;
      let n = 0;
      let count = nthOccurrence;
      while ((arrMatch = regexp.exec(source))) {
        shouldExtends = shouldExtends && arrMatch.index === searchStart;
        if (count > 0 && --count > 0) {
          searchStart = regexp.lastIndex;
          continue;
        }
        let offsetStart = (arrMatch.index || 0) + this.getCaptureGroupLength(arrMatch, options.skipGroup);
        let offsetEnd = offsetStart + this.getCaptureGroupLength(arrMatch, options.selectGroup);
        let newSelection = new Selection(
          shouldExtends ? selection.start : document.positionAt(offsetStart),
          document.positionAt(offsetEnd)
        );
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
