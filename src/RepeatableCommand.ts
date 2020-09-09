export interface IRepeatableCommand {
  repeatCommand() : void;
  clearHistory() : void;
  clone() : IRepeatableCommand;
}

export /* abstract */ class RepeatableCommand implements IRepeatableCommand {
  public repeatCommand() : void {
  }
  public clearHistory() : void {
  }
  // abstract clone() : IRepeatableCommand;
  public clone() : IRepeatableCommand {
    let ret = new (this.constructor as any);
    return Object.assign(ret, this); // shallow copy all properties
  }
}
