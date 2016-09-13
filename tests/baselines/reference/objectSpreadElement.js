//// [objectSpreadElement.ts]
let o = { a: 1, b: 'no' }
let o2 = { b: 'yes', c: true }
let addAfter = { ...o, c: false }
let addBefore = { c: false, ...o }
// Note: ignore still changes the order that properties are printed
let ignore = { b: 'ignored', ...o }
let override = { ...o, b: 'override' }
let nested = { ...{ a: 3, ...{ b: false, c: 'overriden' } }, c: 'whatever' }
let combined = { ...o, ...o2 }
let combinedBefore = { b: 'ok', ...o, ...o2 }
let combinedMid = { ...o, b: 'ok', ...o2 }
let combinedAfter = { ...o, ...o2, b: 'ok' }
let combinedNested = {
    ...{ a: 4, ...{ b: false, c: 'overriden' } },
    d: 'actually new',
    ...{ a: 5, d: 'maybe new' },
}
let propertyNested = { a: { ... o } }
// accessors don't copy the descriptor
// (which means that readonly getters become read/write)
let op = { get a () { return 6 } }
let getter = { ...op, c: 7 }

// null and undefined are just skipped
let spreadNull = { ...null }
let spreadUndefined = { ...undefined }

// methods are not enumerable
class C { p = 1; m() { } }
let c: C = new C()
let spreadC = {...c}

// computed property
let computedFirst = {
    ['before everything']: 12,
    ...o,
    b: 'yes'
}
let computedMiddle = {
    ...o,
    ['in the middle']: 13,
    b: 'maybe?',
    ...o2
}
let computedAfter = {
    ...o,
    b: 'yeah',
    ['at the end']: 14
}

// generics
function f<T, U>(t: T, u: U): { id: string, ...T, ...U } {
    return { id: 'id', ...t, ...u };
}
let exclusive: { id: string, a: number, b: string, c: string, d: boolean } =
    f({ a: 1, b: 'yes' }, { c: 'no', d: false })
let overlap: { id: string, a: number, b: string } =
    f({ a: 1 }, { a: 2, b: 'extra' })
let overlapConflict: { id:string, a: number & string } =
    f({ a: 1 }, { a: 'mismatch' })
let overwriteId: { id: string, a: number, d: string } =
    f({ a: 1, id: 'overwritten' }, { c: 1, d: 'no' })

class D { m() { }; q = 2; }
let classesAreWrong: /*{ id: string, ...C., ...D }*/ =
    f(new C(), new D())


//// [objectSpreadElement.js]
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var o = { a: 1, b: 'no' };
var o2 = { b: 'yes', c: true };
var addAfter = __assign({}, o, { c: false });
var addBefore = __assign({ c: false }, o);
// Note: ignore still changes the order that properties are printed
var ignore = __assign({ b: 'ignored' }, o);
var override = __assign({}, o, { b: 'override' });
var nested = __assign({}, __assign({ a: 3 }, { b: false, c: 'overriden' }), { c: 'whatever' });
var combined = __assign({}, o, o2);
var combinedBefore = __assign({ b: 'ok' }, o, o2);
var combinedMid = __assign({}, o, { b: 'ok' }, o2);
var combinedAfter = __assign({}, o, o2, { b: 'ok' });
var combinedNested = __assign({}, __assign({ a: 4 }, { b: false, c: 'overriden' }), { d: 'actually new' }, { a: 5, d: 'maybe new' });
var propertyNested = __assign({ a: __assign({}, o) });
// accessors don't copy the descriptor
// (which means that readonly getters become read/write)
var op = { get a() { return 6; } };
var getter = __assign({}, op, { c: 7 });
// null and undefined are just skipped
var spreadNull = __assign({}, null);
var spreadUndefined = __assign({}, undefined);
// methods are not enumerable
var C = (function () {
    function C() {
        this.p = 1;
    }
    C.prototype.m = function () { };
    return C;
}());
var c = new C();
var spreadC = __assign({}, c);
// computed property
var computedFirst = __assign((_a = {}, _a['before everything'] = 12, _a), o, { b: 'yes' });
var computedMiddle = __assign({}, o, (_b = {}, _b['in the middle'] = 13, _b.b = 'maybe?', _b), o2);
var computedAfter = __assign({}, o, (_c = { b: 'yeah' }, _c['at the end'] = 14, _c));
// generics
function f(t, u) {
    return __assign({ id: 'id' }, t, u);
}
var exclusive = f({ a: 1, b: 'yes' }, { c: 'no', d: false });
var overlap = f({ a: 1 }, { a: 2, b: 'extra' });
var overlapConflict = f({ a: 1 }, { a: 'mismatch' });
var overwriteId = f({ a: 1, id: 'overwritten' }, { c: 1, d: 'no' });
var D = (function () {
    function D() {
        this.q = 2;
    }
    D.prototype.m = function () { };
    ;
    return D;
}());
var classesAreWrong = f(new C(), new D());
var _a, _b, _c;
