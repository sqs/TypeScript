/// <reference path="../factory.ts" />
/// <reference path="../visitor.ts" />

/*@internal*/
namespace ts {
    export function transformES7(context: TransformationContext) {
        const { hoistVariableDeclaration } = context;

        return transformSourceFile;

        function transformSourceFile(node: SourceFile) {
            return visitEachChild(node, visitor, context);
        }

        function visitor(node: Node): VisitResult<Node> {
            if (node.transformFlags & TransformFlags.ES7) {
                return visitorWorker(node);
            }
            else if (node.transformFlags & TransformFlags.ContainsES7) {
                return visitEachChild(node, visitor, context);
            }
            else {
                return node;
            }
        }

        function visitorWorker(node: Node): VisitResult<Node> {
            switch (node.kind) {
                case SyntaxKind.BinaryExpression:
                    return visitBinaryExpression(<BinaryExpression>node);
                case SyntaxKind.ObjectLiteralExpression:
                    return visitObjectLiteralExpression(node as ObjectLiteralExpression);
                default:
                    Debug.failBadSyntaxKind(node);
                    return visitEachChild(node, visitor, context);
            }
        }

        function visitBinaryExpression(node: BinaryExpression): Expression {
            // We are here because ES7 adds support for the exponentiation operator.
            const left = visitNode(node.left, visitor, isExpression);
            const right = visitNode(node.right, visitor, isExpression);
            if (node.operatorToken.kind === SyntaxKind.AsteriskAsteriskEqualsToken) {
                let target: Expression;
                let value: Expression;
                if (isElementAccessExpression(left)) {
                    // Transforms `a[x] **= b` into `(_a = a)[_x = x] = Math.pow(_a[_x], b)`
                    const expressionTemp = createTempVariable(hoistVariableDeclaration);

                    const argumentExpressionTemp = createTempVariable(hoistVariableDeclaration);

                    target = createElementAccess(
                        createAssignment(expressionTemp, left.expression, /*location*/ left.expression),
                        createAssignment(argumentExpressionTemp, left.argumentExpression, /*location*/ left.argumentExpression),
                        /*location*/ left
                    );

                    value = createElementAccess(
                        expressionTemp,
                        argumentExpressionTemp,
                        /*location*/ left
                    );
                }
                else if (isPropertyAccessExpression(left)) {
                    // Transforms `a.x **= b` into `(_a = a).x = Math.pow(_a.x, b)`
                    const expressionTemp = createTempVariable(hoistVariableDeclaration);

                    target = createPropertyAccess(
                        createAssignment(expressionTemp, left.expression, /*location*/ left.expression),
                        left.name,
                        /*location*/ left
                    );

                    value = createPropertyAccess(
                        expressionTemp,
                        left.name,
                        /*location*/ left
                    );
                }
                else {
                    // Transforms `a **= b` into `a = Math.pow(a, b)`
                    target = left;
                    value = left;
                }

                return createAssignment(target, createMathPow(value, right, /*location*/ node), /*location*/ node);
            }
            else if (node.operatorToken.kind === SyntaxKind.AsteriskAsteriskToken) {
                // Transforms `a ** b` into `Math.pow(a, b)`
                return createMathPow(left, right, /*location*/ node);
            }
            else {
                Debug.failBadSyntaxKind(node);
                return visitEachChild(node, visitor, context);
            }
        }

        function chunkObjectLiteralElements(elements: ObjectLiteralElement[], maximum: number): (SpreadElement | (ShorthandPropertyAssignment | PropertyAssignment)[])[] {
            let chunkObject: (ShorthandPropertyAssignment | PropertyAssignment)[];
            const objects: (SpreadElement | (ShorthandPropertyAssignment | PropertyAssignment)[])[] = [];
            maximum = maximum || elements.length;
            for (let i = 0; i < maximum; i++) {
                const e = elements[i];
                if (e.kind === SyntaxKind.SpreadElement) {
                    if (chunkObject) {
                        objects.push(chunkObject);
                        chunkObject = undefined;
                    }
                    objects.push(e as SpreadElement);
                }
                else {
                    if (!chunkObject) {
                        chunkObject = [];
                    }
                    chunkObject.push(e as ShorthandPropertyAssignment | PropertyAssignment);
                }
            }
            if (chunkObject) {
                objects.push(chunkObject);
            }

            return objects;
        }

        function visitObjectLiteralExpression(node: ObjectLiteralExpression): Expression {
            const numElements = node.properties.length; // how could this be different in the old emitter?
            if (!find(node.properties, (p, i) => i < numElements && p.kind == SyntaxKind.SpreadElement)) {
                // no spread elements mean no transforms
                return node;
            }

            // spread elements emit like so:
            // non-spread elements are chunked together into object literals, and then all are passed to __assign:
            //     { a, ...o, b } => __assign({a}, o, {b});
            // If the first element is a spread element, then the first argument to __assign is {}:
            //     { ...o, a, b, ...o2 } => __assign({}, o, {a, b}, o2)
            const chunks = chunkObjectLiteralElements(node.properties, numElements);
            const objects: Expression[] = [];
            if (chunks.length && !Array.isArray(chunks[0])) {
                objects.push(createObjectLiteral());
            }
            for (const chunk of chunks) {
                if (Array.isArray(chunk)) {
                    objects.push(createObjectLiteral(chunk));
                }
                else {
                    objects.push((chunk as SpreadElement).target);
                }
            }
            return createCall(createIdentifier("__assign"), undefined, objects);

        }
    }
}
