// @target: es5
let o = { a: 1, b: 'no' }

/// private propagates
class PrivateOptionalX {
    private x?: number;
}
class PublicX {
    public x: number;
}
let privateOptionalx: PrivateOptionalX;
let publicx: PublicX;
let o3 = { ...publicx, ...privateOptionalx };
let sn: string | number = o3.x; // error, x is private

// expressions are not allowed
let o1 = { ...1 + 1 };
let o2 = { ...(1 + 1) };

// literal repeats are not allowed, but spread repeats are fine
let duplicated = { b: 'bad', ...o, b: 'bad', ...o2, b: 'bad' }
let duplicatedSpread = { ...o, ...o }

// write-only properties get skipped
let setterOnly = { ...{ set b (bad: number) { } } };
setterOnly.b = 12; // error, 'b' does not exist
