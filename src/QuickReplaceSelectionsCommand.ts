import { QuickReplaceInSelectionCommand } from "./QuickReplaceInSelectionCommand";

export class QuickReplaceSelectionsCommand extends QuickReplaceInSelectionCommand {
  private static readonly matchAllRegex = "^[\\s\\S]*$";

  public performCommandWithArgs(args : any) {
    if (typeof args === 'object' && args.replace !== undefined) {
      this.handleError(this.performReplacement([QuickReplaceSelectionsCommand.matchAllRegex], [args.replace], this.addDefaultFlags()));
    } else {
      this.onTargetChosen(QuickReplaceSelectionsCommand.matchAllRegex);
    }
  }

  public performCommand() {
    let target = "^[\\s\\S]*$";
    this.onTargetChosen(QuickReplaceSelectionsCommand.matchAllRegex);
  }
}
