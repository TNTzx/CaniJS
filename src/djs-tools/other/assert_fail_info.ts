export abstract class AssertFail {
    private __nominalAssertFail() {}

    constructor() {}

    public abstract getMessage(): string
}

export class AssertFailSimple extends AssertFail {
    private __nominalAssertFailSimple() {}

    constructor(protected message: string) {
        super()
    }

    public getMessage() {
        return this.message
    }
}