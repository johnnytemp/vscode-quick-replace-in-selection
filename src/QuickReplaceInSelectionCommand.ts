import { window, TextEditor, TextDocument, Selection, Position, Range, EndOfLine } from 'vscode';

/**
 * QuickReplaceInSelectionCommand class
 */
export class QuickReplaceInSelectionCommand {
  static lastTarget : string = ''
  static lastReplacement : string = ''

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
            this.performReplacement([target], [replacement], false);
          }
        })
      }
    });
  }

  public clearHistory() {
    QuickReplaceInSelectionCommand.lastTarget = '';
    QuickReplaceInSelectionCommand.lastReplacement = '';
  }

  public performReplacement(targets: string[], replacements: string[], isSaved : boolean) {
    if (targets.length == 0) {
      return;
    }
    if (!isSaved) {
      QuickReplaceInSelectionCommand.lastTarget = targets[0];
      QuickReplaceInSelectionCommand.lastReplacement = replacements[0];
    }
    if (targets[0] === '' && replacements[0] === '') {  // this special case is for clear history
      return;
    }

    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let document = editor.document;
    let selections = editor.selections;
    let numSelections = selections.length;
    if (numSelections <= 1 && (numSelections == 0 || editor.selections[0].isEmpty)) {
      selections = [this.getWholeDocumentSelection(document)];
    }

    let ranges : Range[] = [];
    let texts : string[] = [];
    this.computeReplacements(targets, replacements, document, selections, ranges, texts);

    // do editor text replacements in a batch
    this.replaceTexts(editor, ranges, texts);

    // window.showInformationMessage("Replaced from \"" + target + "\" to \"" + replacement + "\"");
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

  public computeReplacements(targets : string[], replacements : string[], document : TextDocument, selections : Selection[], ranges : Range[], texts : string[]) {
    let regexps : RegExp[] = [];
    replacements = replacements.slice();
    targets.forEach((target, i) => {
      regexps.push(new RegExp(target, 'g'));
      replacements[i] = this.unescapeReplacement(replacements[i]);
    });
    let numSelections = selections.length;
    let isCRLF = document.eol == EndOfLine.CRLF;
    for (let i: number = 0; i < numSelections; i++) { // replace all selections or whole document
      let sel = selections[i];
      let text = document.getText(sel);
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
      ranges.push(sel);
      texts.push(text);
    }
  }

  public replaceTexts(editor: TextEditor, ranges: Range[], texts: string[]) : Thenable<boolean> {
    return editor.edit(editBuilder => {
      ranges.forEach((range, index) => {
          editBuilder.replace(range, texts[index]);
      });
  });
  }
}
