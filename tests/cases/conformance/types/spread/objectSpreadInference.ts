declare function infer<T,U,V>(tuv: { ...T, ...U, a: V }): [T,U,V];
function generic<W, X, Y>(w: W, x: X, y: Y) {
    // should infer
    // T = W
    // U = X
    // V = Y
    return infer({ ...w, ...x, a: y, b: 12 });
}
let b: { b: number };
let c: { c: number };
// should infer
// T = {}
// U = { b, c }
// V = { a }
let instantiated = infer({ ...b, ...c, a: 12 });
