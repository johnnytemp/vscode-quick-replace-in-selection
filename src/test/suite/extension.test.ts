import * as assert from 'assert';
import { window, workspace, Selection, Uri, TextDocument, Position } from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import { QuickReplaceInSelectionModule } from '../../QuickReplaceInSelectionModule';
import { SelectMatchesOrAdjustSelectionModule } from '../../SelectMatchesOrAdjustSelectionModule';
import { SelectNextExprFromCursorsCommand } from '../../SelectNextExprFromCursorsCommand';

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

  test('Test replaces correctly', () => {
    let module = QuickReplaceInSelectionModule.getInstance();
    let quickReplace = module.getQuickReplaceCommand();
    let replaceByRule = module.getReplaceByRuleCommand();
    let getIndex = function (this: any, i: number) { return this[i]; };
    assert.equal(12, getIndex.bind([11, 12, 13])(1));
    assert.deepEqual(['\u00a0'], replaceByRule.computeReplacementsWithRule("Decode basic html entities (incomplete)", false, 1, getIndex.bind(['&nbsp;'])));
    assert.deepEqual(['&quot;&lt;&gt;\u00a0'], replaceByRule.computeReplacementsWithRule("Encode html entities (minimal)", false, 1, getIndex.bind(['"<>\u00a0'])));

    let sourceTexts = [
      '"(<a>/&amp;\') \n\\n\\\\n"', // `"(<a>/&amp;') {LF}\n\\n"`
    ];
    // support "\\" in replacement
    assert.deepEqual(['"(<a>/&amp;\') \n\\\\n\\\\\\\\n"'],
      quickReplace.computeReplacementsWithExpressions('\\\\', '\\\\\\\\',                                     false, sourceTexts.length, getIndex.bind(sourceTexts)));
    // support "\n" in replacement
    assert.deepEqual(['"(<a>/&amp;\') \n\n\\\n"'],
      quickReplace.computeReplacementsWithExpressions('\\\\n', '\\n',                                         false, sourceTexts.length, getIndex.bind(sourceTexts)));
    // support "$&" back reference, and default replace all
    assert.deepEqual(['"(<aa>/&aamp;\') \n\\n\\\\n"'],
      quickReplace.computeReplacementsWithExpressions('a', '$&$&',                                            false, sourceTexts.length, getIndex.bind(sourceTexts)));
    // default case sensitive
    assert.deepEqual(['"(<a>/&amp;\') \n\\n\\\\n"'],
      quickReplace.computeReplacementsWithExpressions('A', 'B',                                               false, sourceTexts.length, getIndex.bind(sourceTexts)));
    // support 'i' flag for case insensitive, global flag should still be enabled
    assert.deepEqual(['"(<B>/&Bmp;\') \n\\n\\\\n"'],
      quickReplace.computeReplacementsWithExpressions('A', 'B',                                               false, sourceTexts.length, getIndex.bind(sourceTexts), [], 'i'));

    // ?i etc and no-global-flag related tests
    // support '?im-g' for case insensitive, ^$ means line boundary, and no global replace
    assert.deepEqual(['"(<a>/&am*p;\') \n\\n\\\\n"'],
      quickReplace.computeReplacementsWithExpressions('?im-g [A-Z]\\W*$', '*$&',                              false, sourceTexts.length, getIndex.bind(sourceTexts)));
    // same test as above but with global flag
    assert.deepEqual(['"(<a>/&am*p;\') \n\\n\\\\*n"'],
      quickReplace.computeReplacementsWithExpressions('?im [A-Z]\\W*$', '*$&',                                false, sourceTexts.length, getIndex.bind(sourceTexts)));
    // use-rule command may use flags and with "-g" like
    assert.deepEqual(['"(<a>/&am*p;\') \n\\n\\\\n"'],
      replaceByRule.computeReplacementsWithExpressions('[A-Z]\\W*$', '*$&',                                   false, sourceTexts.length, getIndex.bind(sourceTexts), [], 'im', true /* -g */));
    // use-rule command shouldn't allow "?i "
    assert.deepEqual('"?i A" -> Invalid regular expression: /?i A/: Nothing to repeat',
      replaceByRule.computeReplacementsWithExpressions('?i A', 'B',                                           false, sourceTexts.length, getIndex.bind(sourceTexts)));

    // search with literal string by a leading "*", replacement string don't have special meaning for "$&" and "$$"
    assert.deepEqual(['"(<a>/&amp;\') \n$$\\$$"'],
      quickReplace.computeReplacementsWithExpressions('*\\n', '$$',                                           false, sourceTexts.length, getIndex.bind(sourceTexts)));

    // test default rules
    assert.deepEqual(['"(<a>/&\') \n\\n\\\\n"'],
      replaceByRule.computeReplacementsWithRule("Decode basic html entities (incomplete)",                    false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['&quot;(&lt;a&gt;/&amp;amp;&apos;) \n\\n\\\\n&quot;'],
      replaceByRule.computeReplacementsWithRule("Encode html entities (minimal)",                             false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['"\\(<a>/&amp;\'\\) \n\\\\n\\\\\\\\n"'],
      replaceByRule.computeReplacementsWithRule("Escape literal string for PCRE/extended regular expression", false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['"\\"(<a>/&amp;\') \\n\\\\n\\\\\\\\n\\""'],
      replaceByRule.computeReplacementsWithRule("Json stringify",                                             false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['"\\"(<a>\\/&amp;\') \\n\\\\n\\\\\\\\n\\""'],
      replaceByRule.computeReplacementsWithRule("Json stringify (also escape '/')",                           false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['"\\"(\\u003ca\\u003e/\\u0026amp;\') \\n\\\\n\\\\\\\\n\\""'],
      replaceByRule.computeReplacementsWithRule("Json stringify (also escape '<', '>', '&')",                 false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['(<a>/&amp;\') \n\n\\n'],
      replaceByRule.computeReplacementsWithRule("Json-decode string (incomplete)",                            false, sourceTexts.length, getIndex.bind(sourceTexts)));

    assert.deepEqual(['"\\"(<a>/&amp;\') \\n\\\\n\\\\\\\\n\\""'],
      replaceByRule.computeReplacementsWithRule("Quote as C-string",                                          false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['\'"(<a>/&amp;\\\') \n\\\\n\\\\\\\\n"\''],
      replaceByRule.computeReplacementsWithRule("Quote as single-quoted string (only escape `\\`, `'`)",      false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['"(<a>/&amp\n\') \n----\n\\n\\\\n"'],
      replaceByRule.computeReplacementsWithRule("Split CSV/TSV into lines",                                   false, sourceTexts.length, getIndex.bind(sourceTexts)));

    assert.deepEqual(['"(<a>/&amp;\')\n\\n\\\\n"'],
      replaceByRule.computeReplacementsWithRule("Trim lines",                                                 false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['"(<a>/&amp;\') , \\n\\\\n"'],
      replaceByRule.computeReplacementsWithRule("Join lines by comma",                                        false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['\'"(<a>/&amp;\') \', \'\\n\\\\n"\', '],
      replaceByRule.computeReplacementsWithRule("Single-quote lines and join by comma",                       false, sourceTexts.length, getIndex.bind(sourceTexts)));
    assert.deepEqual(['""(<a>/&amp;\') ", "\\n\\\\n"", '],
      replaceByRule.computeReplacementsWithRule("Double-quote lines and join by comma",                       false, sourceTexts.length, getIndex.bind(sourceTexts)));
  });

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

    assert.deepEqual([new Selection(0, 0, 0, 0), new Selection(2, 0, 2, 0)], // cursors at start of 1st & 3rd lines
      editor.selections, 'initial selections');
    selectNextEx.performCommandWithArgs({ target: "?i \\b[a-z]+.*" }); // select a word to line end --> selects "Hello..." and "a>..."
    assert.deepEqual([new Selection(0, 0, 0, 11), new Selection(2, 5, 2, 16)],
      editor.selections, 'selections after Select Next Matches From Cursors...');
    selectInSelection.performCommandWithArgs({ target: "?{1,2}(&)([a-z]+);" }); // select between () in "&([a-z]+);" --> selects "amp"
    assert.deepEqual([new Selection(2, 9, 2, 12)],
      editor.selections, 'selections after Select All Matches In Selection...');
    selectNextEx.performCommandWithArgs({ target: "[a-z]" }); // select next letter --> selects "n" of "\n"
    assert.deepEqual([new Selection(3, 1, 3, 2)],
      editor.selections, 'selections after Select Next Matches From Cursors...');
    selectUpToNextEx.performCommandWithArgs({ target: "[a-z]" }); // extends selection up to next letter --> selects "n\\n"
    assert.deepEqual([new Selection(3, 1, 3, 5)],
      editor.selections, 'selections after Select Up To Next Matches From Cursors...');
  });
});
