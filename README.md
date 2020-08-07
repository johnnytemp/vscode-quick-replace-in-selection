# Quick Replace In Selection README

Quick Replace In Selection let you search and replace all occurrences by a regular expression, within the current selection or the whole document.

It also support predefined rules to be used, and those rules allow multiple replacements in order at a time.

All matches are case sensitive by default.

## Commands Demo

### Quick Replace In Selection

![Quick Replace In Selection](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/replaceInSelection.gif)

### Quick Replace In Selection (Use Rule)... (Shortcut: `Ctrl-K Ctrl-H`)

![Quick Replace In Selection (Use Rule)...](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/replaceInSelectionByRule.gif)

## Features

This extension use the regular expression that JavaScript support for search and replace. In addition, a `$&` in the "Replace to" input box or `"replace"` values in the rules mean the whole match.

The "Replace to" input box support extra escape sequence `\n`, `\r`, `\t`, `\\` as in regular expression. Other unrecognized sequences are preserved.

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

* `quick-replace.rules`: define the rules to be used by the command `Quick Replace In Selection (Use Rule)...`

    E.g. to define a rule which replaces newlines to `\n`, to this in your settings file:

    ```
    "quick-replace.rules": {
        "Test Rule's Name": {
            "find": ["\n"],
            "replace": ["\\n"]
        }
    }
    ```

    Remark: besides the keys `"find"` & `"replace"` above, also support the key `"flags"` for extra regular expression's modifiers. E.g. add `"flags": "i"` for case insensitive match.

Hints:

- For how to define rules in the configuration, you could look at the default rules as examples. (`Ctrl-Shift-P` to open command palette then enter "Open Default Settings (JSON)")
- You could make use of the default rules `Escape literal string for PCRE/extended regular expression` (optional) and then `Json stringify` and to put your regular expression in the `"find"` settings of `quick-replace.rules`.

## Default rules

Some default rules are listed here:

- Encode html entities (minimal)
- Escape literal string for PCRE/extended regular expression
- Join lines by comma
- Json stringify
- Quote as C-string
- Split CSV/TSV into lines
- Trim lines
- Single-quote lines and join by comma

## Known Issues

None.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)

## License

MIT - See [LICENSE](LICENSE)
