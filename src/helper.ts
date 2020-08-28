
import { TextDocument, Selection, Position, Range } from 'vscode';

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

export function getWordRangeIfPositionIsInWord(document: TextDocument, pos: Position) : Range | undefined {
  let wordRange = document.getWordRangeAtPosition(pos);
  if (wordRange !== undefined && wordRange.start.character < pos.character && pos.character < wordRange.end.character) {
    return wordRange;
  }
  return undefined;
}

export function isSpaceOrTab(char : string) {
  return char === ' ' || char === "\t"
}

export function getSpacesOrTabsRangeIfPositionIsInSpacesOrTabs(document: TextDocument, pos: Position) : Range | undefined {
  let line = document.lineAt(pos);
  let text = line.text;
  let lineEnd = line.range.end.character;
  let i = pos.character;
  if (!(i > 0 && i < lineEnd && isSpaceOrTab(text[i-1]) && isSpaceOrTab(text[i]))) {
    return undefined; // not in spaces or tabs
  }
  let j = i+1;
  i = i-1;
  while (i > 0 && isSpaceOrTab(text[i-1])) {
    --i;
  }
  while (j < lineEnd && isSpaceOrTab(text[j])) {
    ++j;
  }
  return new Range(line.lineNumber, i, line.lineNumber, j);
}

export function expandSelectionForIncompleteWordsAtBoundariesOrShiftInWordCursorsToWordStart(document : TextDocument, selections : Selection[]) : Selection[] {
  let newSelections : Selection[] = [];
  let hasChanged = false;
  for (let sel of selections) {
    if (sel.isEmpty) {
      let pos = sel.start;
      if (pos.character > 0) {
        let wordRange = getWordRangeIfPositionIsInWord(document, pos);
        if (wordRange) {
          sel = new Selection(wordRange.start, wordRange.start);
          hasChanged = true;
        }
      }
    } else {
      let start = sel.start;
      let end = sel.end;
      let startWordRange = getWordRangeIfPositionIsInWord(document, sel.start);
      let endWordRange = getWordRangeIfPositionIsInWord(document, sel.end);
      let needAdjust = false;
      if (startWordRange) {
        start = startWordRange.start;
        needAdjust = true;
      }
      if (endWordRange) {
        end = endWordRange.end;
        needAdjust = true;
      }
      if (needAdjust) {
        sel = new Selection(start, end);
        hasChanged = true;
      }
    }
    newSelections.push(sel);
  }
  if (hasChanged) {
    return newSelections;
  }
  return selections;
}

export function shiftOrExtendsInWhitespacesCursorsOrSelectionEndsToNextNonWhitespaces(document : TextDocument, selections : Selection[]) : Selection[] {
  let newSelections : Selection[] = [];
  let hasChanged = false;
  for (let sel of selections) {
    if (sel.isEmpty) {
      let pos = sel.start;
      if (pos.character > 0) {
        let range = getSpacesOrTabsRangeIfPositionIsInSpacesOrTabs(document, pos);
        if (range) {
          sel = new Selection(range.end, range.end);
          hasChanged = true;
        }
      }
    } else {
      let endRange = getSpacesOrTabsRangeIfPositionIsInSpacesOrTabs(document, sel.end);
      if (endRange) {
        sel = new Selection(sel.start, endRange.end);
        hasChanged = true;
      }
    }
    newSelections.push(sel);
  }
  if (hasChanged) {
    return newSelections;
  }
  return selections;
}
