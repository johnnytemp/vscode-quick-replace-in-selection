
import { TextDocument, Selection, Position } from 'vscode';

export function getWholeDocumentSelection(document: TextDocument) {
  let documentLastPosition = document.lineAt(document.lineCount - 1).rangeIncludingLineBreak.end;
  return new Selection(new Position(0, 0), documentLastPosition);
}

export function escapeLiteralAsRegexString(literal: string) : string {
  return literal.replace(/[\]\\{}(|)[.*+?^$]/g, '\\$&');
}

export function getEndLineOfLineSelection(sel: Selection) : number {
  return sel.end.line - (sel.end.character === 0 && sel.end.line > sel.start.line ? 1 : 0);
}

export function splitSelectionToLineSelections(document: TextDocument, selections: Selection[], lineSelections: Selection[]) {
  for (let sel of selections) {
    let lastLine = getEndLineOfLineSelection(sel);
    if (sel.start.line === lastLine) {
      lineSelections.push(sel);
    } else {
      lineSelections.push(new Selection(sel.start, document.lineAt(sel.start.line).range.end)); // first line
      let endLine = sel.end.line;
      for (let line = sel.start.line + 1; line < endLine; ++line) {
        let range = document.lineAt(line).range;
        lineSelections.push(new Selection(range.start, range.end));
      }
      if (sel.end.line === lastLine) {
        lineSelections.push(new Selection(new Position(sel.end.line, 0), sel.end));
      }
    }
  }
}
