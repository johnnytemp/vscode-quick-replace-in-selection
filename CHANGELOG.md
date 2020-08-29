# Change Log

All notable changes to the "select-matches-or-adjust-selection" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0] - 2020-08-30

- Initial release
- Support select matches by input box commands corresponding 4 select scopes: matches in selection, matches in line selections, next matches from cursors, and up to next matches from cursors.
- Support select matches using predefined patterns, using the above 4 select scopes
- Support a "Normalize Selection" command to exclude (unselect) surrounding whitespaces with Ctrl-Shift-A or Cmd-Shift-A.
- Support a few commands, e.g. "Ctrl-K 4", to help select the '$' sign of variable faster.
