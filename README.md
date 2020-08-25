# Select Matches/Adjust Selection Using Regex Or Rules README

This extension let you search and select the matches by a regular expression (regex) (or literal string[#3](#footnote3)), within the current selection, the whole document, or after cursors.

It also let you adjust selection by some *predefined rules* to be used. E.g. you could "Unselect Surrounding Whitespaces" and "Normalize Selection".

**Note**: By default, all matches in the regex are *case sensitive* [#1](#footnote1), and `^`, `$`  match *text selection boundaries* instead of line boundaries [#2](#footnote2).

## Commands & Demo

### "Select All Matches In Selection...", "Select Next Matches From Cursors..." and "Select Up To Next Matches From Cursors..."

![Select Matches In Selection or From Cursors](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/selectInSelectionOrFromCursors.gif)

Remark: "Select All Matches In Selection..." also serve the purpose of "Find All In Selection".

## Features

This extension use the regular expression that JavaScript support for search.

E.g. "`.+` replace to `[$&]`" would mean replace any non-empty string (excluding newline characters), in the selected text(s), to be wrapped by `[]`.

For more information on regular expression, you may checkout:

- https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285

You could also select only a substring of the match with a leading "`?<skip group no.>,<select group no.>;`" in the regex input/parameter.  
  E.g. An input "`?1,2;(<)(.*?)>`" will only select the text in-between a `< >` pair. Groups refer to regex's capture group. The "skip group" must start from the start and immediately followed by the "select group", otherwise the behavior is undefined.

## Requirements

None.

## Extension Settings

This extension contributes the following settings:

- `quickReplaceInSelection.rules`: define the rules to be used by the command `Quick Replace In Selection (Use Rule)...`

    E.g. to define a rule which replaces newlines to `\n`, to this in your settings file:

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

- TODO: rule 1

## Keyboard shortcuts

- You could also define custom keyboard shortcuts for each command, e.g.:

```
{
    "key": "alt+m",
    "command": "selectMatchesOrAdjustSelection.selectMatchesInSelection,
    "when": "editorTextFocus",
    "args": {
        "target": "'[^'\\r\\n]*'"
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

<a name="footnote1"></a>#1 - to do the opposite, type a leading "<code>?i </code>" before the regex in the input box (not a part of regex), or use `"flags"` in rules.  
<a name="footnote2"></a>#2 - to do the opposite, type a leading "`+`" (preferred) or "<code>?m </code>" before the regex in the input box (not a part of regex), or use `"flags"` in rules.  
<a name="footnote3"></a>#3 - to search & replace with a *literal string*, add a leading "`*`" in the regex input box. This also disable backslash escape and `$&` in the "Replace to" input box. (this feature is not available to rules)
