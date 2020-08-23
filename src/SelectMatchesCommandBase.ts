import { window, TextEditor, Selection } from 'vscode';
import { SearchOrReplaceCommandBase } from './SearchOrReplaceCommandBase';
import { SelectMatchesOrAdjustSelectionModule } from './SelectMatchesOrAdjustSelectionModule';

/**
 * SelectMatchesCommandBase class
 */
export class SelectMatchesCommandBase extends SearchOrReplaceCommandBase {
  static lastTarget : string = '';

  public getCommandType() : string {
    return 'input';
  }

  public getMethodName() : string {
    return 'Unknown Method';
  }

  protected getModule() : SelectMatchesOrAdjustSelectionModule {
    return SelectMatchesOrAdjustSelectionModule.getInstance();
  }

  protected getLastSelectSearchTarget() {
    return SelectMatchesCommandBase.lastTarget;
  }

  protected setLastSelectSearchTarget(target: string) {
    SelectMatchesCommandBase.lastTarget = target;
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
        this.getModule().setLastSelectCommand(this);
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

  public computeSelection(editor: TextEditor, newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    return null; // to be overridden
  }

  public parseOptionsAndBuildRegexes(editor: TextEditor, target: string, outInfo: any, flags: string | undefined) {
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

  /**
   * prefix format is "?{<skipGroup>,<selectGroup>}", "?{optionFlags}" OR "?{optionFlags|<skipGroup>,<selectGroup>}"
   */
  protected parseOptionsFromSearchTarget(target: { ref: string }) : { optionFlags : string, skipGroup: number | null, selectGroup: number } {
    let ret : { optionFlags : string, skipGroup: number | null, selectGroup: number } = {
      optionFlags: '',
      skipGroup: null,
      selectGroup: 0
    };
    let bracesMatch = target.ref.match(/^\?\{([^{}]*)\}/);
    if (bracesMatch) {
      let center = bracesMatch[1];
      let front = center;
      let lastDigitPairMatch = center.match(/^([0-9a-zA-Z,=]+\|)*(-1|\d+),(-1|\d+)$/); // e.g. ?{1,2} OR ?{e} OR ?{e|1,2}
      if (lastDigitPairMatch) {
        ret.skipGroup = parseInt(lastDigitPairMatch[2]);
        ret.selectGroup = parseInt(lastDigitPairMatch[3]);
        front = center.substr(0, (lastDigitPairMatch[1] || '').length > 1 ? lastDigitPairMatch[1].length - 1 : 0);
      }
      let leadingLettersMatch = front.match(/^([0-9]*[a-zA-Z]*)(\||$)/);
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
