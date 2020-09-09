import { workspace, WorkspaceConfiguration } from 'vscode';

export type SelectRule = { [key: string] : any };
export type SelectRules = { [key: string]: SelectRule };
type SelectRulesFalseAble = { [key: string]: { [key: string] : any } | false };


export class SelectMatchesOrAdjustSelectionConfig {
  private _config : WorkspaceConfiguration;
  private _selectRules : SelectRules = {};

  public constructor() {
    this._config = this.reloadConfig();
    workspace.onDidChangeConfiguration(this.onConfigChanged, this);
  }

  public getSelectRules() : SelectRules {
    return this._selectRules;
  }

  public onConfigChanged() {
    this._config = this.reloadConfig();
  }

  public reloadConfig() : WorkspaceConfiguration {
    let vsConfig = workspace.getConfiguration('selectMatchesOrAdjustSelection');
    this.reloadSelectRules(vsConfig);
    return vsConfig;
  }

  protected reloadSelectRules(vsConfig: WorkspaceConfiguration) {
    let configSelectRules: SelectRulesFalseAble = vsConfig.get("patterns") || {};
    this._selectRules = {};
    let names = Object.keys(configSelectRules);
    names.sort();   // sort by rule names
    names.forEach(key => {
      let rule = configSelectRules[key];
      // Remark: use `"Rule name": false` to delete a rule explicity
      if (rule === false || (rule['find'] === undefined)) {
        return;
      }
      this._selectRules[key] = rule;
    });
  }
}
