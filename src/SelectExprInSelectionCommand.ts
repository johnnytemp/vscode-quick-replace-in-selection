import { window, TextEditor, Selection } from 'vscode';
import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { SearchOrReplaceCommandBase } from './SearchOrReplaceCommandBase';
import * as helper from './helper';

/**
 * SelectExprInSelectionCommand class
 */
export class SelectExprInSelectionCommand extends SearchOrReplaceCommandBase {
  static lastTarget : string = '';

  public getCommandType() : string {
    return 'input';
  }

  protected getModule() : QuickReplaceInSelectionModule {
    return QuickReplaceInSelectionModule.getInstance();
  }

  protected getLastSelectSearchTarget() {
    return SelectExprInSelectionCommand.lastTarget;
  }

  protected setLastSelectSearchTarget(target: string) {
    SelectExprInSelectionCommand.lastTarget = target;
  }

  public clearHistory() {
    this.setLastSelectSearchTarget('');
  }

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.target !== undefined) {
      this.handleError(this.performSelection(args.target, this.addDefaultFlags(), true));
    } else {
      this.performCommand();
    }
  }

  public performCommand() {
    window.showInputBox({
      placeHolder: 'Target to select (regex)',
      value: this.getLastSelectSearchTarget()
    }).then((target: string | undefined) => {
      if (target !== undefined) {
        this.handleError(this.performSelection(target, this.addDefaultFlags()));
      }
    });
  }

  public performSelection(target: string, flags?: string, isByArgs?: boolean) : string | null {
    if (!isByArgs && this.getCommandType() === 'input') {
      this.setLastSelectSearchTarget(target);
    }
    if (target === '') { // this special case is for clear history
      return null;
    }
    let editor = window.activeTextEditor;
    if (!editor) {
      return 'No editor';
    }
    let newSelections: Selection[] = [];
    let outInfo : any = { options: {}, regexp: {} };
    let error = this.computeSelection(editor, newSelections, target, outInfo, flags);
    if (error !== null) {
      return error;
    }
    if (newSelections.length > 0) {
      // console.log('Select In Selection: ' + newSelections.length + " matches found in " + editor.selections.length + " selections.");
      editor.selections = newSelections;
      editor.revealRange(newSelections[0]);
    } else {
      return 'No matches found to select, for regex /' + outInfo.regexp.source + '/';
    }
    return null;
  }

  protected parseOptionsAndBuildRegexes(editor: TextEditor, target: string, outInfo: any, flags: string | undefined) {
    let inOutTarget = { ref: target };
    let options = this.parseOptionsFromSearchTarget(inOutTarget);
    target = inOutTarget.ref;
    outInfo.options = options;
    let regexp : RegExp | null = null;
    let regexps: RegExp[] = [];
    let error = this.buildRegexes(regexps, [target], { ref: null}, flags, true);
    if (error === null) {
      regexp = regexps[0];
      outInfo.regexp = regexp;
    }
    let document = editor.document;
    let selections = editor.selections;
    return { error, options, regexp, document, selections };
  }

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

  /**
   * prefix format is "?{<skipGroup>,<selectGroup>}", "?{optionFlags}" OR "?{optionFlags|<skipGroup>,<selectGroup>}"
   */
  public parseOptionsFromSearchTarget(target: { ref: string }) : { optionFlags : string, skipGroup: number | null, selectGroup: number } {
    let ret : { optionFlags : string, skipGroup: number | null, selectGroup: number } = {
      optionFlags: '',
      skipGroup: null,
      selectGroup: 0
    };
    let bracesMatch = target.ref.match(/^\?\{([^{}]*)\}/);
    if (bracesMatch) {
      let center = bracesMatch[1];
      let front = center;
      let lastDigitPairMatch = center.match(/^([a-zA-Z,=]+\|)*(-1|\d+),(-1|\d+)$/); // e.g. ?{1,2} OR ?{e} OR ?{e|1,2}
      if (lastDigitPairMatch) {
        ret.skipGroup = parseInt(lastDigitPairMatch[2]);
        ret.selectGroup = parseInt(lastDigitPairMatch[3]);
        front = center.substr(0, (lastDigitPairMatch[1] || '').length > 1 ? lastDigitPairMatch[1].length - 1 : 0);
      }
      let leadingLettersMatch = front.match(/^([a-zA-Z]+)(\||$)/);
      if (leadingLettersMatch) {
        ret.optionFlags = leadingLettersMatch[1];
      }
      target.ref = target.ref.substr(bracesMatch[0].length);
    }
    return ret;
  }

  protected getCaptureGroupLength(arrMatch: RegExpExecArray, group: number | null) : number {
    if (group !== null) {
      let str = arrMatch[group];
      if (str !== undefined) {
        return str.length;
      }
    }
    return 0;
  }
}
