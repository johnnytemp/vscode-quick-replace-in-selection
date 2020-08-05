import { workspace, WorkspaceConfiguration } from 'vscode';

type QuickReplaceRules = { [key: string]: { [key: string] : any } };
type QuickReplaceRulesFalseAble = { [key: string]: { [key: string] : any } | false };


export class QuickReplaceInSelectionConfig {
  private _config : WorkspaceConfiguration;
  private _rules : QuickReplaceRules = {};

  public constructor() {
    this._config = this.reloadConfig();
    workspace.onDidChangeConfiguration(this.onConfigChanged, this);
  }

  public getRules() : QuickReplaceRules {
    return this._rules;
  }

  public onConfigChanged() {
    this._config = this.reloadConfig();
  }

  public reloadConfig() : WorkspaceConfiguration {
    let vsConfig = workspace.getConfiguration('quick-replace');

    let configRules: QuickReplaceRulesFalseAble = vsConfig.get("rules") || {};
    this._rules = {};
    let names = Object.keys(configRules);
    names.sort();   // sort by rule names
    // for (let key in configRules) {
    names.forEach(key => {
      let rule = configRules[key];
      // Remark: use `"Rule name": false` to delete a rule explicity
      if (rule === false || (rule['find'] === undefined || rule['replace'] === undefined))
        return;
      if (typeof rule['find'] === 'string' && typeof rule['replace'] === 'string') {
        rule = Object.assign({}, rule, { find: [rule.find], replace: [rule.replace] });
      }
      this._rules[key] = rule;
    });
    return vsConfig;
  }
}
