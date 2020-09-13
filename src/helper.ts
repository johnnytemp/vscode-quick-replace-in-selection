
import { TextDocument, Selection, Position } from 'vscode';

export function getWholeDocumentSelection(document: TextDocument) {
  let documentLastPosition = document.lineAt(document.lineCount - 1).rangeIncludingLineBreak.end;
  return new Selection(new Position(0, 0), documentLastPosition);
}

export function escapeLiteralAsRegexString(literal: string) : string {
  return literal.replace(/[\]\\{}(|)[.*+?^$]/g, '\\$&');
}
