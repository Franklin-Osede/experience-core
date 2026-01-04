export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(id: string, props: T) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public getProps(): T {
    return { ...this.props };
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id === object._id;
  }
}

function isEntity(v: unknown): v is Entity<unknown> {
  return v instanceof Entity;
}
