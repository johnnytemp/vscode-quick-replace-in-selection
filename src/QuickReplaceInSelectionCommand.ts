import { window, TextEditor, TextDocument, Selection, Position, Range, EndOfLine } from 'vscode';

/**
 * QuickReplaceInSelectionCommand class
 */
export class QuickReplaceInSelectionCommand {
  static lastTarget : string = '';
  static lastReplacement : string = '';

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
            this.handleError(this.performReplacement([target], [replacement], false, true, ''));
          }
        });
      }
    });
  }

  public clearHistory() {
    QuickReplaceInSelectionCommand.lastTarget = '';
    QuickReplaceInSelectionCommand.lastReplacement = '';
  }

  public handleError(error : string | null) {
    if (error === null) {
      return;
    }
    // error = 'QuickReplaceInSelection: ' + error;
    window.showErrorMessage(error);
    // console.log(error);
  }

  public performReplacement(targets: string[], replacements: string[], isSaved : boolean, escapesInReplace : boolean, flags: string) : string | null {
    if (targets.length === 0 || targets.length !== replacements.length) {
      return 'Invalid find/replace parameters';
    }
    if (!isSaved) {
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
      selections = [this.getWholeDocumentSelection(document)];
    }

    let ranges : Range[] = selections;
    let texts : string[] = [];
    let error = this.prepareReplacements(targets, replacements, escapesInReplace, document, selections, texts, flags);

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

  public getWholeDocumentSelection(document: TextDocument) {
    let documentLastPosition = document.lineAt(document.lineCount - 1).rangeIncludingLineBreak.end;
    return new Selection(new Position(0, 0), documentLastPosition);
  }

  /// treat `\n` as newline and `\\` as `\`. However, unknown sequence `\?` will be preserved, instead of escaped.
  public unescapeReplacement(replacement : string) : string {
    return replacement.replace(/\\./g, (text) => {
      switch (text[1]) {
        case 'n': return "\n";
        case 'r': return "\r";
        case 't': return "\t";
        case '\\': return "\\";
        default:
          return text;
      }
    });
  }

  public prepareReplacements(targets : string[], replacements : string[], escapesInReplace : boolean, document : TextDocument, selections : Selection[], texts : string[], flags? : string) : string | null {
    let numSelections = selections.length;
    let isCRLF = document.eol === EndOfLine.CRLF;
    return this.computeReplacements(targets, replacements, escapesInReplace, isCRLF, numSelections, (i: number) => document.getText(selections[i]), texts, flags);
  }

  // for unit tests
  public computeReplacementsWithExpressions(find: string, replace: string, isCRLF : boolean, numSelections : number, selectionGetter : (i: number) => string, texts? : string[], flags? : string) : string | string[] {
    texts = texts || [];
    let error = this.computeReplacements([find], [replace], true, isCRLF, numSelections, selectionGetter, texts, flags);
    return error !== null ? error : texts;
  }

  public computeReplacements(targets : string[], replacements : string[], escapesInReplace : boolean, isCRLF : boolean, numSelections : number, selectionGetter : (i: number) => string, texts : string[], flags? : string | undefined) : string | null {
    if (targets.length !== replacements.length) {
      return 'Invalid find/replace parameters';
    }
    if (flags === undefined) {
      flags = '';
    }
    let regexps : RegExp[] = [];
    replacements = escapesInReplace ? replacements.slice() : replacements;
    let isOk = true;
    for (let i = 0; i < targets.length; ++i) {
      let target = targets[i];
      try {
        regexps.push(new RegExp(target, 'g' + flags));
      }
      catch (e) {
        let error = '"' + target +'" -> ' + (e as Error).message; // e.message is like "Invalid regular expression /.../: ..."
        return error;
      }
      if (escapesInReplace) {
        replacements[i] = this.unescapeReplacement(replacements[i]);
      }
    }

    for (let i: number = 0; i < numSelections; i++) { // replace all selections or whole document
      let text = selectionGetter(i);
      if (isCRLF) {
        text = text.replace(/\r\n/g, "\n"); // CRLF to LF, so that "\n" is normalized to represent the whole newlines
        for (let i = 0; i < regexps.length; ++i) {
          text = text.replace(regexps[i], replacements[i]);
        }
        text = text.replace(/\n/g, "\r\n"); // convert LF back to CRLF
      } else {
        for (let i = 0; i < regexps.length; ++i) {
          text = text.replace(regexps[i], replacements[i]);
        }
      }
      texts.push(text);
    }
    return null;
  }

  public replaceTexts(editor: TextEditor, ranges: Range[], texts: string[]) : Thenable<boolean> {
    return editor.edit(editBuilder => {
      ranges.forEach((range, index) => {
          editBuilder.replace(range, texts[index]);
      });
  });
  }
}
