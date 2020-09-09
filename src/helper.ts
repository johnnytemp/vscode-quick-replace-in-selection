
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

export function incrementLeftBound(document : TextDocument, selections : Selection[]) : Selection[] {
  let source = document.getText();
  let newSelections: Selection[] = [];
  for (let sel of selections) {
    let offset = document.offsetAt(sel.start);
    if (offset > 0) {
      offset -= (offset >= 2 && source.substr(offset - 2, 2) === "\r\n") ? 2 : 1;
      sel = new Selection(sel.end, document.positionAt(offset)); // reversed selection
    } else {
      sel = new Selection(sel.end, sel.start);
    }
    newSelections.push(sel);
  }
  return newSelections;
}

export function incrementBothBounds(document : TextDocument, selections : Selection[]) : Selection[] {
  let source = document.getText();
  let newSelections: Selection[] = [];
  for (let sel of selections) {
    let start = sel.start;
    let end = sel.end;
    let offset = document.offsetAt(start);
    if (offset > 0) {
      offset -= (offset >= 2 && source.substr(offset - 2, 2) === "\r\n") ? 2 : 1;
      start = document.positionAt(offset);
    }
    offset = document.offsetAt(end);
    if (offset < source.length) {
      offset += (offset <= source.length - 2 && source.substr(offset, 2) === "\r\n") ? 2 : 1;
      end = document.positionAt(offset);
    }
    sel = new Selection(start, end);
    newSelections.push(sel);
  }
  return newSelections;
}

export function decrementBothBounds(document : TextDocument, selections : Selection[]) : Selection[] {
  let source = document.getText();
  let newSelections: Selection[] = [];
  for (let sel of selections) {
    let start = sel.start;
    let end = sel.end;
    let offset = document.offsetAt(start);
    if (!sel.isEmpty) {
      offset += (source.substr(offset, 2) === "\r\n") ? 2 : 1;
      start = document.positionAt(offset);
    }
    let startOffset = offset;
    offset = document.offsetAt(end);
    if (offset > startOffset) {
      offset -= (source.substr(offset - 2, 2) === "\r\n") ? 2 : 1;
      end = document.positionAt(offset);
    }
    sel = new Selection(start, end);
    newSelections.push(sel);
  }
  return newSelections;
}

export function selectWordAndItsPrefixIfAny(document : TextDocument, selections : Selection[], wordPrefix: string) : Selection[] {
  wordPrefix = wordPrefix.substr(0, 1); // first character, or empty string
  let source = document.getText();
  let newSelections : Selection[] = [];
  let hasChanged = false;
  for (let sel of selections) {
    let pos = sel.start;
    let offset = document.offsetAt(pos);
    if (offset < source.length && source[offset] === wordPrefix) {
      pos = document.positionAt(offset + 1);  // some language won't treat '$' as a word, so if cursor is at '$', move it right by 1 first to select the word there if any. (Otherwise, if no word there, doesn't select anything...)
    }

    // Info: for some languages like .js .ts .php, document.getWordRangeAtPosition() already include the '$', but the below is still worth it as it isn't guaranteed.
    let wordRange = document.getWordRangeAtPosition(pos);
    if (!wordRange) {
      newSelections.push(sel);
      continue;
    }
    let range = sel.union(wordRange);
    let start = range.start;
    offset = document.offsetAt(wordRange.start);
    if (offset > 0 && source[offset - 1] === wordPrefix) {
      start = document.positionAt(offset - 1);
    }
    sel = new Selection(start, range.end);
    newSelections.push(sel);
    hasChanged = true;
  }
  if (hasChanged) {
    return newSelections;
  }
  return selections;
}
