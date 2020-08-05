import { workspace, WorkspaceConfiguration } from 'vscode';

type QuickReplaceRules = { [key: string]: { [key: string] : any } };


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

    let configRules: QuickReplaceRules = vsConfig.get("rules") || {};
    this._rules = {};
    for (let key in configRules) {
      let rule = configRules[key];
      if (rule['find'] === undefined || rule['replace'] === undefined)
        continue;
      this._rules[key] = rule;
    }
    return vsConfig;
  }
}
