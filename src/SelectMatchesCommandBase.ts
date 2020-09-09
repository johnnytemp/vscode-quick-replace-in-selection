import { window, TextEditor, TextDocument, Selection } from 'vscode';
import { SearchOrReplaceCommandBase } from './SearchOrReplaceCommandBase';
import { SelectMatchesOrAdjustSelectionModule } from './SelectMatchesOrAdjustSelectionModule';

export type SelectMatchesOptions = { optionFlags : string, skipGroup: number | null, selectGroup: number };

/**
 * SelectMatchesCommandBase class
 */
export class SelectMatchesCommandBase extends SearchOrReplaceCommandBase {
  static lastTarget : string = '';
  private _selectionsPreProcessor : (document : TextDocument, selections : Selection[]) => Selection[];
  private _selectionsPostProcessor : (document : TextDocument, newSelections : Selection[]) => void;

  public constructor() {
    super()
    this._selectionsPreProcessor = (document, selections) => { return selections; };
    this._selectionsPostProcessor = (document, newSelections) => { };
  }

  public setSelectionPreProcessor(processFunc : (document : TextDocument, selections : Selection[]) => Selection[]) {
    this._selectionsPreProcessor = processFunc;
  }

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
    if (typeof args === 'object' && args.find !== undefined) {
      this.handleError(this.performSelection(args.find, this.addDefaultFlags()));
    } else {
      this.performCommand();
    }
  }

  public repeatCommand() {
    this.handleError(this.performSelection(this.getLastSelectSearchTarget(), this.addDefaultFlags()));
  }

  public performCommand() {
    window.showInputBox({
      placeHolder: 'Target to select (regex)',
      value: this.getLastSelectSearchTarget()
    }).then((target: string | undefined) => {
      if (target !== undefined) {
        this.getModule().setLastSelectCommand(this);
        this.handleError(this.performSelection(target, this.addDefaultFlags(), true));
      }
    });
  }

  public performSelection(target: string, flags?: string, fromUserInput?: boolean, patternName?: string) : string | null {
    if (fromUserInput && this.getCommandType() === 'input') {
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
    let selections = editor.selections;
    selections = this._selectionsPreProcessor(editor.document, selections);
    let error = this.computeSelection(editor, selections, newSelections, target, outInfo, flags);
    if (error !== null) {
      return error;
    }
    this._selectionsPostProcessor(editor.document, newSelections);
    let { deleteFlag, alignFlag } = this.extractCommonOptions(outInfo.options);
    if (newSelections.length > 0) {
      // console.log('Select In Selection: ' + newSelections.length + " matches found in " + editor.selections.length + " selections.");
      if (deleteFlag) {
        editor.selections = newSelections;
        this.replaceTexts(editor, newSelections, []);
      } else if (alignFlag) {
        this.alignSelections(editor, newSelections);
      } else {
        editor.selections = newSelections;
      }
      editor.revealRange(newSelections[0]);
    } else {
      return 'No matches found to select, for ' + (patternName ?
        'pattern "' + patternName + '"':
        'regex /' + outInfo.regexp.source + '/'
      );
    }
    return null;
  }

  public alignSelections(editor: TextEditor, newSelections: Selection[]) {
    let maxColumn = 0;
    for (let sel of newSelections) {
      if (sel.start.character > maxColumn) {
        maxColumn = sel.start.character;
      }
    }
    let aligningSelections: Selection[] = [];
    let alignTexts: string[] = [];
    // let alignedSelections: Selection[] = [];
    for (let sel of newSelections) {
      let start = sel.start;
      let gapLength = maxColumn - start.character;
      // if (gapLength > 0) {
        aligningSelections.push(new Selection(start.line, start.character, start.line, start.character));
        alignTexts.push(''.padEnd(gapLength, ' '));
      // }
      // alignedSelections.push(new Selection(start.line, maxColumn, start.line, maxColumn));
    }
    editor.selections = aligningSelections;
    this.replaceTexts(editor, aligningSelections, alignTexts);
  }

  public computeSelection(editor: TextEditor, selections: Selection[], newSelections: Selection[], target: string, outInfo: any, flags?: string) : string | null {
    return null; // to be overridden
  }

  protected extractCommonOptions(options: SelectMatchesOptions) : { nthOccurrence: number, deleteFlag: boolean, alignFlag: boolean, movedNextFlag: boolean } {
    let nthOccurrence = parseInt(options.optionFlags);
    nthOccurrence = isNaN(nthOccurrence) ? 0 : nthOccurrence;
    let deleteFlag = options.optionFlags.indexOf('d') !== -1;
    let alignFlag = options.optionFlags.indexOf('a') !== -1;
    let movedNextFlag = options.optionFlags.indexOf('M') !== -1;
    return { nthOccurrence, deleteFlag, alignFlag, movedNextFlag };
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
    return { error, options, regexp, document };
  }

  /**
   * prefix format is "?<skipGroup>,<selectGroup>;", "?[nthOccurrence][optionFlags];" OR "?[nthOccurrence][optionFlags]|<skipGroup>,<selectGroup>;"
   */
  protected parseOptionsFromSearchTarget(target: { ref: string }) : SelectMatchesOptions {
    let ret : SelectMatchesOptions = {
      optionFlags: '',
      skipGroup: null,
      selectGroup: 0
    };
    let bracesMatch = target.ref.match(/^\?([-,=|_A-Za-z0-9]*);/);
    if (bracesMatch) {
      let center = bracesMatch[1];
      let front = center;
      let lastDigitPairMatch = center.match(/^([0-9a-zA-Z,=]+\|)*(-1|\d+),(-1|\d+)$/); // e.g. "?1,2;" OR "?e;" OR "?e|1,2;"
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
