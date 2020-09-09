
import { window, TextEditor, Range } from 'vscode';
import * as helper from './helper';
import { RepeatableCommand } from './RepeatableCommand';

export class SearchOrReplaceCommandBase extends RepeatableCommand {

  public handleError(error : string | null) {
    if (error === null) {
      return;
    }
    // error = 'QuickReplaceInSelection: ' + error;
    window.showErrorMessage(error);
    // console.log(error);
  }

  protected addDefaultFlags(flags? : string | undefined, noGlobalFlag? : boolean | undefined) {
    // Remark: the default flags is only global flag. Likely won't change.
    let defaultFlags = noGlobalFlag ? '' : 'g';
    flags = flags !== undefined ? flags : '';
    return defaultFlags + flags;
  }

  public getFlagsFromFlagsString(flagsString : string) {
    let matches = null;
    if (flagsString.length > 0 && flagsString.length <= 8) {
      matches = flagsString.match(/^([gimsuy]+)?(-g)?$/);
    }
    let flags = '';
    let noGlobalFlag = false;
    if (matches !== null) {
      flags = (matches[1] || '').replace('g', '');
      noGlobalFlag = matches[2] === '-g';
    }
    return this.addDefaultFlags(flags, noGlobalFlag);
  }

  //==== implementation methods ====

  public getCommandType() : string {
    return ''; // unknown type
  }

  protected allowSpecialPrefixInRegex() {
    return this.getCommandType() === 'input';
  }

  public haveEscapesInReplace() : boolean {
    return false;
  }

  protected buildRegexes(regexps : (RegExp|string)[], targets : string[], inOutReplacements : { ref: string[] | null }, flags: string | undefined, wantAllRegex?: boolean) : string | null {
    let escapesInReplace = this.haveEscapesInReplace();
    let isAllowSpecialPrefix = this.allowSpecialPrefixInRegex();
    var initialFlags = flags === undefined ? '' : flags;
    let replacements: string[] = [];
    if (inOutReplacements.ref === null) { // i.e. build just search regex, no replacements
      escapesInReplace = false;
    } else {
      if (targets.length !== inOutReplacements.ref.length) {
        return 'Invalid count of find/replace parameters';
      }
      replacements = inOutReplacements.ref = escapesInReplace ? inOutReplacements.ref.slice() : inOutReplacements.ref;
    }
    let isOk = true;
    for (let i = 0; i < targets.length; ++i) {
      let target = targets[i];
      let flags = initialFlags;

      if (isAllowSpecialPrefix) {
        // Fix: this special prefix syntax is for "input expressions" command only
        let prefixMatch = target.match(/^(?:\+|\?(?=[gimsuy-])([gimsuy]+)?(-g)? )/); // support either /^\+/ (equal the "m" flag) OR /^\?[gimsuy]*(-g)? / for flags
        if (prefixMatch !== null) {
          let prefix = prefixMatch[0];
          target = target.substr(prefix.length);
          if (prefix === '+') {
            flags += 'm';
          } else {
            flags += prefixMatch[1] || '';
            if (prefixMatch[2] === '-g') {
              flags = flags.replace(/g/g, '');
            }
          }
        } else if (target.startsWith("*")) {
          // use literal string instead of "new RegExp", and always skip unescapeReplacement() for this item ("$&" also lose its special meaning)
          let literalTarget = target.substr(1);
          regexps.push(wantAllRegex ? new RegExp(helper.escapeLiteralAsRegexString(literalTarget), flags) : literalTarget);
          continue;
        }
      }

      try {
        regexps.push(new RegExp(target, flags));
      }
      catch (e) {
        let error = '"' + target +'" -> ' + (e as Error).message; // e.message is like "Invalid regular expression /.../: ..."
        return error;
      }
      if (escapesInReplace) {
        replacements[i] = this.unescapeReplacement(replacements[i]);
      }
    }
    return null;
  }

  /// treat `\n` as newline and `\\` as `\`. However, unknown sequence `\?` will be preserved, instead of escaped.
  public unescapeReplacement(replacement : string) : string {
    return replacement.replace(/\\./g, (text) => {
      switch (text[1]) {
        case 'n': return "\n";
        case 'r': return "\r";
        case 't': return "\t";
        case '\\': return "\\";
        default:
          return text;
      }
    });
  }

  public replaceTexts(editor: TextEditor, ranges: Range[], texts: string[]) : Thenable<boolean> {
    return editor.edit(editBuilder => {
      ranges.forEach((range, index) => {
          editBuilder.replace(range, texts[index] || '');
      });
    });
  }

}
