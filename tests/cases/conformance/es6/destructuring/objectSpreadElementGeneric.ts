function f<T, U, V>(t: T, u: U, v: V): void {
    let o: { ...T, ...U, ...V };
    const same: { ...T, ...U, ...V } = o; // ok
    const reversed: { ...V, ...U, ...T } = o; // error, reversed
    const endIsOk: { ...U, ...T, ...V } = o; // error, U and T are still reversed
    const missingT: { ...U, ...V } = o; // error, missing T
    const missingU: { ...T, ...V } = o; // error, missing T
    const missingV: { ...T, ...U } = o; // error, missing T

    const emptyTarget: { } = { ...t, ...u } // ok
    const emptySource: { ...T, ...U } = { }; // error, {} is not assignable to U (or T)

    let optionalNumber: { sn?: number };
    let optionalString: { sn?: string };
    let optionalBoolean: { sn?: boolean };
    const unionCutoff: { ...T, sn?: number | string | boolean } = { ...optionalBoolean, ...t, ...optionalString, ...optionalNumber } // ok
    unionCutoff.sn; // ok
    const optionalCutoff = { ...t, ...optionalNumber }; // ok
    optionalCutoff.sn; // ok
    

    const interspersed: { first: string, ...T, second: string, ...U, third: string } =
        { first: '1', ...t, second: '2', ...u, third: '3' }; // ok
    const interspersedMissingU: { first: string, second: string, ...T, third: string } =
        { first: '1', ...t, second: '2', ...u, third: '3' }; // error, 'U' is missing
    let source: { ...T, second: string, ...U, second: string };
    const interspersedSlim: { ...T, ...U, third: string } = source; // ok

    const extras: { first: string, ...T, second: string, secondsecond: boolean, ...U, third: string } =
        { first: '1', ...t, second: '2', secondsecond: true, ...u, third: '3', secondsecond: 'false' }; // ok
        const extrasOverridden: { first: string, ...T, second: string, ...U, third: string, secondsecond: string } =
        { first: '1', ...t, second: '2', secondsecond: true, ...u, third: '3', secondsecond: 'false' }; // ok
        const extrasOverridden2: { first: string, second: string, secondsecond: string, third: string, ...T, ...U } =
        { first: '1', ...t, second: '2', secondsecond: true, ...u, third: '3', secondsecond: 'false' }; // ok


    const mismatchFirst: { first: string, ...T, second: string, ...U, third: string } =
        { firrrrrrst: '1', ...t, second: '2', ...u, third: '3' }; // error, 'first' not found
    const mismatchSecond: { first: string, ...T, second: string, ...U, third: string } =
        { first: '1', ...t, ssssssssecond: '2', ...u, third: '3' }; // error, 'second' not found
    const mismatchLast: { first: string, ...T, second: string, ...U, third: string } =
        { first: '1', ...t, second: '2', ...u, thirrrrrrrd: '3' }; // error, 'third' not found
}
