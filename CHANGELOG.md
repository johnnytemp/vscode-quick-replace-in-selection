# Change Log

All notable changes to the "select-matches-or-adjust-selection" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.1] - 2020-09-04

### Fix
- Fix command "Select Matches (Repeat Last)" not work correctly in case of keyboard shortcut with just "selectScope" args.
- Fix "Simple expression" to work for negative numbers.

## [0.10.0] - 2020-08-31

### Added
- Two new patterns for regex's ()-pair
- Add command "Decrement Selection Starts and Ends"
- Support only specify args.selectScope for selectMatchesOrAdjustSelection.selectMatchesByPattern command.

### Changed
- Changed a macOS's shortcut from `Alt-;` to `Cmd-;`.
- Better error for "No matches found to select, ..."

### Fix
- Fix command "Ctrl-k h" & "Ctrl-k l" not work.

## [0.9.1] - 2020-08-30

- Initial release
- Support select matches by input box commands corresponding 4 select scopes: matches in selection, matches in line selections, next matches from cursors, and up to next matches from cursors.
- Support select matches using predefined patterns, using the above 4 select scopes
- Support a "Normalize Selection" command to exclude (unselect) surrounding whitespaces with Ctrl-Shift-A or Cmd-Shift-A.
- Support a few commands, e.g. "Ctrl-K 4", to help select the '$' sign of variable faster.
