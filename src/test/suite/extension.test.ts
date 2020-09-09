import * as assert from 'assert';
import { window, workspace, Selection, Uri, TextDocument, Position } from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import { SelectMatchesOrAdjustSelectionModule } from '../../SelectMatchesOrAdjustSelectionModule';

var editorContent = 'Hello world' + "\n" +
  '' + "\n" +
  '  "(<a>/&amp;\') \n\\n\\\\n"' + "\n" + // `  "(<a>/&amp;') {LF}\n\\n"`
  '' + "\n" +
  'End.';

function envSetup() : Promise<any> {
  return new Promise<any>((resolve, reject) => {
    // new document
    var untitledUri: Uri = Uri.parse("untitled:" + "C:\\untitled.txt");
    workspace.openTextDocument({ content: editorContent }).then((document: TextDocument) => {
      window.showTextDocument(document, 1, false).then(editor => {
        editor.selections = [new Selection(0, 0, 0, 0), new Selection(2, 0, 2, 0)];
        resolve();
      });
    });
  });
}

suite('Extension Test Suite', () => {
  suiteSetup((done) => {
    envSetup().then(done);
  });

  suiteTeardown(() =>{});
  vscode.window.showInformationMessage('Start all tests.');

  test('Test selects correctly', () => {
    let editor = window.activeTextEditor;
    assert.notEqual(editor, undefined);
    if (editor === undefined) {
      return;
    }
    let document = editor.document;

    assert.equal(editorContent, document.getText());

    let module = SelectMatchesOrAdjustSelectionModule.getInstance();
    let selectInSelection = module.getSelectInSelectionCommand();
    let selectNextEx = module.getSelectNextExCommand();
    let selectUpToNextEx = module.getSelectUpToNextExCommand();
    // let selectInLineSelections = module.getSelectInLineSelectionsCommand();
    let selectByPattern = module.getSelectMatchesByPatternCommand();

    assert.deepEqual([new Selection(0, 0, 0, 0), new Selection(2, 0, 2, 0)], // cursors at start of 1st & 3rd lines
      editor.selections, 'initial selections');
    selectNextEx.performCommandWithArgs({ find: "?i \\b[a-z]+.*" }); // select a word to line end --> selects "Hello..." and "a>..."
    assert.deepEqual([new Selection(0, 0, 0, 11), new Selection(2, 5, 2, 16)],
      editor.selections, 'selections after Select Next Matches From Cursors...');
    selectInSelection.performCommandWithArgs({ find: "?1,2;(&)([a-z]+);" }); // select between () in "&([a-z]+);" --> selects "amp"
    assert.deepEqual([new Selection(2, 9, 2, 12)],
      editor.selections, 'selections after Select All Matches In Selection...');
    selectNextEx.performCommandWithArgs({ find: "[a-z]" }); // select next letter --> selects "n" of "\n"
    assert.deepEqual([new Selection(3, 1, 3, 2)],
      editor.selections, 'selections after Select Next Matches From Cursors...');
    selectUpToNextEx.performCommandWithArgs({ find: "[a-z]" }); // extends selection up to next letter --> selects "n\\n"
    assert.deepEqual([new Selection(3, 1, 3, 5)],
      editor.selections, 'selections after Select Up To Next Matches From Cursors...');

    editor.selections = [new Selection(0, 0, 2, 0)]; // select first two lines
    selectByPattern.performCommandWithArgs({
      patternName: "Line",
      selectScope: "selectMatchesInLineSelections"
    }); // select two lines, the 2nd is empty
    assert.deepEqual([new Selection(0, 0, 0, 11), new Selection(1, 0, 1, 0)],
      editor.selections, 'selections after Select All Matches In Line Selections, with pattern "Line"...');

    selectByPattern.performCommandWithArgs({
      patternName: "Line Start",
      selectScope: "selectMatchesInLineSelections"
    }); // select two lines' starts, both are empty
    assert.deepEqual([new Selection(0, 0, 0, 0), new Selection(1, 0, 1, 0)],
      editor.selections, 'selections after Select All Matches In Line Selections, with pattern "Line"...');
  });
});
