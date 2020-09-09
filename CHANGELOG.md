# Change Log

All notable changes to the "quick-replace-in-selection" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2020-08-14

### Added
- Support regex input box to start with "*" to mean the expression which follows is a literal string instead of regex, and so is the replace-to expression. (i.e. the backslash escape and "$&" just match literally)  
Remark: rules are predefined and so no need to be able to replace instantly, so they may use the "Escape literal string for PCRE/extended regular expression" rule to escape a string to be matched literally.

## [1.1.0] - 2020-08-12

### Added
- New command "Quick Replace In Selection (Repeat Last)"
- Allow keyboard shortcuts to be associated to a rule.
- Support special "-g" postfix in regex's "flags" to mean replace first match only (for each selection). E.g. "?mi-g " in the input box, or `"flags": "mi-g"` in rules.

### Changed
- Settings `quick-replace.rules` has been changed to `quickReplaceInSelection.rules`

### Fix
- "find" attribute in the rules accidentally supported special prefixes like "+" & "?i ". It is removed now.

## [1.0.1] - 2020-08-08

- Fix README markdown problems which show "?i" instead of "?i " wrongly.

## [1.0.0] - 2020-08-07

- Initial release
- Support inputting "Target to replace" and "Replace to"
- Support replace by a defined rule with multiple replacements
