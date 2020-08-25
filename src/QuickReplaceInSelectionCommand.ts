import { window, TextDocument, Selection, Range, EndOfLine } from 'vscode';
import { QuickReplaceInSelectionModule } from './QuickReplaceInSelectionModule';
import { SearchOrReplaceCommandBase } from './SearchOrReplaceCommandBase';
import * as helper from './helper';

/**
 * QuickReplaceInSelectionCommand class -> should this be called QuickReplaceInSelectionInputCommand & "Quick Replace In Selection (Input)"?
 */
export class QuickReplaceInSelectionCommand extends SearchOrReplaceCommandBase {
  static lastTarget : string = '';
  static lastReplacement : string = '';

  public getCommandType() : string {
    return 'input';
  }

  protected getModule() : QuickReplaceInSelectionModule {
    return QuickReplaceInSelectionModule.getInstance();
  }

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.target !== undefined && args.replacement !== undefined) {
      this.handleError(this.performReplacement([args.target], [args.replacement], this.addDefaultFlags(), true));
    } else {
      this.performCommand();
    }
  }

  public performCommand() {
    window.showInputBox({
      placeHolder: 'Target to replace (regex)',
      value: QuickReplaceInSelectionCommand.lastTarget
    }).then((target: string | undefined) => {
      if (target !== undefined) {
        window.showInputBox({
          placeHolder: 'Replace to',
          value: QuickReplaceInSelectionCommand.lastReplacement
        }).then((replacement: string | undefined) => {
          if (replacement !== undefined) {
            this.getModule().setLastCommand(this);
            this.handleError(this.performReplacement([target], [replacement], this.addDefaultFlags()));
          }
        });
      }
    });
  }

  public repeatCommand() {
    this.handleError(this.performReplacement([QuickReplaceInSelectionCommand.lastTarget], [QuickReplaceInSelectionCommand.lastReplacement], this.addDefaultFlags()));
  }

  public clearHistory() {
    QuickReplaceInSelectionCommand.lastTarget = '';
    QuickReplaceInSelectionCommand.lastReplacement = '';
  }

  //==== implementation methods ====

  public haveEscapesInReplace() : boolean {
    return true;
  }

  /// @param flags won't further add default flags 'g'
  public performReplacement(targets: string[], replacements: string[], flags?: string, isByArgs?: boolean) : string | null {
    if (targets.length === 0 || targets.length !== replacements.length) {
      return 'Invalid count of find/replace parameters';
    }
    if (!isByArgs && this.getCommandType() === 'input') {
      QuickReplaceInSelectionCommand.lastTarget = targets[0];
      QuickReplaceInSelectionCommand.lastReplacement = replacements[0];
    }
    if (targets[0] === '' && replacements[0] === '') {  // this special case is for clear history
      return null;
    }

    let editor = window.activeTextEditor;
    if (!editor) {
      return 'No editor';
    }

    let document = editor.document;
    let selections = editor.selections.slice();
    let numSelections = selections.length;
    let isUseWholeDocumentSelection = numSelections <= 1 && (numSelections === 0 || selections[0].isEmpty);
    if (isUseWholeDocumentSelection) {
      selections = [helper.getWholeDocumentSelection(document)];
    }

    let ranges : Range[] = selections;
    let texts : string[] = [];
    let error = this.prepareReplacements(targets, replacements, document, selections, texts, flags);

    // do editor text replacements in a batch
    if (error === null) {
      this.replaceTexts(editor, ranges, texts)/* .then(() => {
        // select all text afterwards for empty selection
        if (isUseWholeDocumentSelection) {
          (editor as TextEditor).selections = [this.getWholeDocumentSelection(document)];
        }
      }) */;
    }

    // window.showInformationMessage("Replaced from \"" + target + "\" to \"" + replacement + "\"");
    return error;
  }

  private prepareReplacements(targets : string[], replacements : string[], document : TextDocument, selections : Selection[], texts : string[], flags : string | undefined) : string | null {
    let numSelections = selections.length;
    let isCRLF = document.eol === EndOfLine.CRLF;
    return this.computeReplacements(targets, replacements, isCRLF, numSelections, (i: number) => document.getText(selections[i]), texts, flags);
  }

  // for unit tests
  public computeReplacementsWithExpressions(find: string, replace: string, isCRLF : boolean, numSelections : number, selectionGetter : (i: number) => string, texts? : string[], flags? : string, noGlobalFlag? : boolean) : string | string[] {
    texts = texts || [];
    let error = this.computeReplacements([find], [replace], isCRLF, numSelections, selectionGetter, texts, this.addDefaultFlags(flags, noGlobalFlag));
    return error !== null ? error : texts;
  }

  public computeReplacements(targets : string[], replacements : string[], isCRLF : boolean, numSelections : number, selectionGetter : (i: number) => string, texts : string[], flags : string | undefined) : string | null {
    let regexps : (RegExp|string)[] = [];
    let inOutReplacements = { ref: replacements };
    var err = this.buildRegexes(regexps, targets, inOutReplacements, flags);
    replacements = inOutReplacements.ref;
    if (err !== null) {
      return err;
    }

    for (let i: number = 0; i < numSelections; i++) { // replace all selections or whole document
      let text = selectionGetter(i);
      if (isCRLF) {
        text = text.replace(/\r\n/g, "\n"); // CRLF to LF, so that "\n" is normalized to represent the whole newlines
        for (let i = 0; i < regexps.length; ++i) {
          let regexp = regexps[i];
          text = typeof regexp === 'string' ? text.split(regexp).join(replacements[i]) : text.replace(regexp, replacements[i]);
        }
        text = text.replace(/\n/g, "\r\n"); // convert LF back to CRLF
      } else {
        for (let i = 0; i < regexps.length; ++i) {
          let regexp = regexps[i];
          text = typeof regexp === 'string' ? text.split(regexp).join(replacements[i]) : text.replace(regexp, replacements[i]);
        }
      }
      texts.push(text);
    }
    return null;
  }
}
