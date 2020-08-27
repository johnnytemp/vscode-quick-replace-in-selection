# Select Matches/Adjust Selection Using Regex Or Rules README

This extension let you search and select the matches by a regular expression (regex) (or literal string[#3](#footnote3)), within the current selection, the whole document, or after cursors.

It also let you adjust selection by some *predefined rules* (or *patterns*) to be used. E.g. you could "Unselect Surrounding Whitespaces" and "Normalize Selection".

**Note**: By default, all matches in the regex are *case sensitive* [#1](#footnote1), and `^`, `$`  match *text selection boundaries* instead of line boundaries [#2](#footnote2).

## Commands & Demo

### "Select All Matches In Selection...", "Select Next Matches From Cursors..." and "Select Up To Next Matches From Cursors..."

![Select Matches In Selection or From Cursors](https://github.com/johnnytemp/vscode-quick-replace-in-selection/raw/master/images/selectInSelectionOrFromCursors.gif)

Remark: "Select All Matches In Selection..." also serve the purpose of "Find All In Selection".

## Features

1. This extension use the regular expression that JavaScript support for search.

    E.g. "select all matches in selection for  `.+`" would mean select any non-empty string (excluding newline characters), in the selected text(s).

    For more information on regular expression, you may checkout:

    - https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285

2. You could also select only a substring of the match with the format "`?<skip group no.>,<select group no.>;`" in front of the regex input/parameter.  
  E.g. An input "`?1,2;(<)(.*?)>`" will only select the text in-between a `< >` pair. "Group no" corresponds to regex's capture group. The "skip group" must start from the start and immediately followed by the "select group", otherwise the behavior is undefined.

3. Furthermore, there are some additional options for all the "Select Matches" commands, such as *nth-occurrence* and `d` for delete. The syntax is "`?[<nth-occurrence>][<option-flags>][|<skip group no.>,<select group no.>];<normal-regex>`". Current supported option flags are the following:

    - `d` - delete the selected matches.
    - `e` - e for extends (conditionally); only apply for "Select Next Matches From Cursors". This flag instruct the logic to (conditionally) extends non-empty selections if each visited occurrence (including the final match of each) is touching previous selection/occurrence.  
        E.g. if you search for "`?2e;\w+ ?`", and the selection is the "The " in "The Quick Brown Fox Jumps...", it will result in extended selection so that "The Quick Brown " is selected (because both occurrences "Quick " & "Brown " is touching each other and also with the selection). Without this `e` flag, "Brown " - the second occurrence - will be selected instead.
    - Experimental flags (may change in future):
        - `a` - a for align; align the selected matches (assume at most one per line) to the same column. Alignment is undefined if the assumption isn't true.
        - `M` - M for (forced) move; only apply for "Select Next Matches From Cursors" and "Select Up To Next Matches From Cursors". This flag roughly means "jump really to the next match instead of the current position's match". It forbids a match at exactly the cursor position for each empty selection (aka cursors). (For each non-empty selection(s), they are assumed the last match already. Thus the first search position - selection end - is valid for the "next match")

## Requirements

None.

## Extension Settings

This extension contributes the following settings:

- `selectMatchesOrAdjustSelection.patterns`: define the patterns to be used by the command `Select Matches Using Pattern (or input)...`

    E.g. to define a pattern which search newlines, add this to your settings file:

    ```
    "selectMatchesOrAdjustSelection.patterns": {
        "Test Pattern's Name": {
            "find": "\r?\n"
        }
    }
    ```

Hints:

- For how to define patterns in the configuration, you could look at the default patterns as examples. (`Ctrl-Shift-P` to open command palette, type "Open Default Settings (JSON)" & Enter, and search for `selectMatchesOrAdjustSelection.patterns`)
- To hide a default pattern, add `"<Default Pattern Name>": false` inside `selectMatchesOrAdjustSelection.patterns`.
- You could make use of the default rules of the VS Code extension "Quick Replace In Selection" (by johnnywong), `Escape literal string for PCRE/extended regular expression` (optional) and then `Json stringify` and to put your regular expression in the `"find"` settings of `selectMatchesOrAdjustSelection.patterns`.
- An experimental feature: to only replace the first match (instead of all matches) in each selection, put a leading "<code>?-g </code>" in the regex input box or `"find"` parameter.

## Default patterns

Some default patterns are listed here:

- Line
- Simple expression
- Simple string
- Whitespaces to non-whitespaces boundary
- Word

## Keyboard shortcuts

- You could also define custom keyboard shortcuts for each command, e.g.:

```
{
    "key": "alt+'",
    "command": "selectMatchesOrAdjustSelection.selectMatchesInSelection",
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

<a name="footnote1"></a>#1 - to do the opposite, type a leading "<code>?i </code>" before the regex in the input box (not a part of regex), or in the `"find"` value for patterns.  
<a name="footnote2"></a>#2 - to do the opposite, type a leading "`+`" (preferred) or "<code>?m </code>" before the regex in the input box (not a part of regex), or in the `"find"` value for patterns.  
<a name="footnote3"></a>#3 - to search with a *literal string*, add a leading "`*`" in the regex input box.
