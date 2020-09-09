# Quick Replace In Selection README

Quick Replace In Selection let you search and replace all occurrences by a regular expression (regex) (or literal string[#1](#footnote1)), within the current selection or the whole document.

It also support *predefined rules* to be used, and those rules allow *multiple replacements* in order at a time.

**Note**: By default, all matches are *case sensitive* [#2](#footnote2), and `^`, `$`  match *text selection boundaries* instead of line boundaries [#3](#footnote3).

## Commands & Demo

### Quick Replace In Selection

![Quick Replace In Selection](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/replaceInSelection.gif)

### Quick Replace In Selection (Use Rule)... (Shortcut: `Ctrl-K Ctrl-H`)

![Quick Replace In Selection (Use Rule)...](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/replaceInSelectionByRule.gif)

### Quick Replace In Selection (Repeat Last)

Repeat the last replace action which use either input expressions, or a rule.

## Features

This extension use the regular expression that JavaScript support for search and replace. In addition, a `$&` in the "Replace to" input box or `"replace"` values in the rules mean the whole match.

The "Replace to" input box support extra escape sequence `\n`, `\r`, `\t`, `\\` as in regex. Other unrecognized sequences are preserved.

E.g. "`.+` replace to `[$&]`" would mean replace any non-empty string (excluding newline characters), in the selected text(s), to be wrapped by `[]`.

For more information on regular expression, you may checkout:

- https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285

## Major Use Case

Sometimes you might want to replace some character(s) to another within current text selection (e.g. to delimit the text into lines).

However, VS Code's builtin `Replace` may have these inconveniences:

- too many steps: need to open dialog, enable the "Find in selection" option, some `Tab` keys or clicks, and need to press/trigger "Replace All"
- it changes the last Find Target memory

This extension solves them all.

## Requirements

None.

## Extension Settings

This extension contributes the following settings:

- `quickReplaceInSelection.rules`: define the rules to be used by the command `Quick Replace In Selection (Use Rule)...`

    E.g. to define a rule which replaces newlines to `\n`, add this to your settings file:

    ```
    "quickReplaceInSelection.rules": {
        "Test Rule's Name": {
            "find": ["\n"],
            "replace": ["\\n"]
        }
    }
    ```

    Remark: Next to  `"find":` & `"replace":` above, can specify `"flags"` to add regular expression's modifiers.  
    &nbsp; E.g. specify `"flags": "i"` for case insensitive match, or `"flags": "m"` to change `^`, `$` to match line boundaries instead.

Hints:

- For how to define rules in the configuration, you could look at the default rules as examples. (`Ctrl-Shift-P` to open command palette, type "Open Default Settings (JSON)" & Enter, and search for `quickReplaceInSelection.rules`)
- You could make use of the default rules `Escape literal string for PCRE/extended regular expression` (optional) and then `Json stringify` and to put your regular expression in the `"find"` settings of `quickReplaceInSelection.rules`.
- An experimental feature: to only replace the first match (instead of all matches) in each selection, put a trailing `-g` in the `"flags"` of the rule, or a leading "<code>?-g </code>" in regex input box.

## Default rules

Some default rules are listed here:

- Encode html entities (minimal)
- Escape literal string for PCRE/extended regular expression
- Join lines by comma
- Json stringify
- Quote as C-string
- Single-quote lines and join by comma
- Split CSV/TSV into lines
- Trim lines

## Keyboard shortcuts

- You could also define custom keyboard shortcuts for each rule, e.g.:

    ```
    {
        "key": "alt+j",
        "command": "quickReplaceInSelection.replaceInSelectionByRule",
        "when": "editorTextFocus",
        "args": {
            "ruleName": "Json stringify"
        }
    }
    ```

## Known Issues

None.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)

## License

MIT - See [LICENSE](LICENSE)

## Footnotes

<a name="footnote1"></a>#1 - to search & replace with a *literal string*, add a leading "`*`" in the regex input box. This also disable backslash escape and `$&` in the "Replace to" input box. (this feature is not available to rules)  
<a name="footnote2"></a>#2 - to do the opposite, type a leading "<code>?i </code>" before the regex in the input box (not a part of regex), or use `"flags"` in rules.  
<a name="footnote3"></a>#3 - to do the opposite, type a leading "`+`" (preferred) or "<code>?m </code>" before the regex in the input box (not a part of regex), or use `"flags"` in rules.
