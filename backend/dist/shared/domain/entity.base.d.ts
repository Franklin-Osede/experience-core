export declare abstract class Entity<T> {
    protected readonly _id: string;
    protected props: T;
    constructor(id: string, props: T);
    get id(): string;
    equals(object?: Entity<T>): boolean;
}
