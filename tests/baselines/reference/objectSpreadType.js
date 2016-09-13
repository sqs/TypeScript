//// [objectSpreadType.ts]
function f<T,U>(t: T, u: U): { id: string, ...T, ...U } {
    var spreads: { id: string, ...T, ...U } = { id: '1', ...t, ...u };
    return spreads;
}


//// [objectSpreadType.js]
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function f(t, u) {
    var spreads = __assign({ id: '1' }, t, u);
    return spreads;
}


//// [objectSpreadType.d.ts]
declare function f<T, U>(t: T, u: U): {
    id: string;
    ...T;
    ...U;
};
