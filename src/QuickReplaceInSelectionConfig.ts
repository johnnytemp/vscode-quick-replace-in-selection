import { workspace, WorkspaceConfiguration } from 'vscode';

export type QuickReplaceRule = { [key: string] : any };
export type QuickReplaceRules = { [key: string]: QuickReplaceRule };
type QuickReplaceRulesFalseAble = { [key: string]: { [key: string] : any } | false };


export class QuickReplaceInSelectionConfig {
  private _config : WorkspaceConfiguration;
  private _rules : QuickReplaceRules = {};
  private _repeatCommandUseCache : boolean = false;

  public constructor() {
    this._config = this.reloadConfig();
    workspace.onDidChangeConfiguration(this.onConfigChanged, this);
  }

  public getRules() : QuickReplaceRules {
    return this._rules;
  }

  public getRepeatCommandUseCache() : boolean {
    return this._repeatCommandUseCache;
  }

  public onConfigChanged() {
    this._config = this.reloadConfig();
  }

  public reloadConfig() : WorkspaceConfiguration {
    let vsConfig = workspace.getConfiguration('quickReplaceInSelection');
    this.reloadReplaceRules(vsConfig);
    this._repeatCommandUseCache = vsConfig.get("repeatCommandUseCache") || false;
    return vsConfig;
  }

  protected reloadReplaceRules(vsConfig: WorkspaceConfiguration) {
    let configRules: QuickReplaceRulesFalseAble = vsConfig.get("rules") || {};
    this._rules = {};
    let names = Object.keys(configRules);
    names.sort();   // sort by rule names
    // for (let key in configRules) {
    names.forEach(key => {
      let rule = configRules[key];
      // Remark: use `"Rule name": false` to delete a rule explicity
      if (rule === false || (rule['find'] === undefined || rule['replace'] === undefined)) {
        return;
      }
      if (typeof rule['find'] === 'string' && typeof rule['replace'] === 'string') {
        rule = Object.assign({}, rule, { find: [rule.find], replace: [rule.replace] });
      }
      this._rules[key] = rule;
    });
  }
}
