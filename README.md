# quick-replace-in-selection README

Quick Replace In Selection let you search and replace by a regular expression within the current selection or the whole document.

It also support predefined rules to be used, and those rules allow multiple replacements in order at a time.

## Features

This extension use regular expression for search and replace. In addition, a `$&` in the "Replace to" input box or `"replace"` values in the rules mean the whole match.

The "Replace to" input box support extra escape sequence `\n`, `\r`, `\t`, `\\` as in regular expression. Other unrecognized sequences are preserved.

E.g. "`.+` replace to `[$&]`" would mean replace any non-empty selected text to be wrapped by `[]`.

For more information on regular expression, you may checkout:

- https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285

### Quick Replace In Selection

![Quick Replace In Selection](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/replaceInSelection.gif)

### Quick Replace In Selection (Use Rule)... (Shortcut: `Ctrl-K Ctrl-H`)

![Quick Replace In Selection (Use Rule)...](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/replaceInSelectionByRule.gif)

## Requirements

None.

## Extension Settings

This extension contributes the following settings:

* `quick-replace.rules`: define the rules to be used by the command `Quick Replace In Selection (Use Rule)...`

    E.g.
    ```
    {
        "Test Rule's Name": {
            "find": "\n",
            "replace": "\\n"
        }
    }
    ```

Hints:

- For how to define rules in the configuration, you could look at the default rules as examples.
- You could make use of the default rules `Escape literal string for PCRE/extended regular expression` (optional) and then `Json stringify` and to put your regular expression in the `"find"` settings of `quick-replace.rules`.

## Known Issues

None.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)

## License

MIT - See [LICENSE](LICENSE)
