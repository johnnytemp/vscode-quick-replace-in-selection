import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import { QuickReplaceInSelectionModule } from '../../QuickReplaceInSelectionModule';

suite('Extension Test Suite', () => {
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
});
