/// <reference path="../factory.ts" />
/// <reference path="../visitor.ts" />
/// <reference path="../../../node_modules/@types/node/index.d.ts" />

/*@internal*/
namespace ts {
    export function transformRelay(context: TransformationContext) {
        let currentSourceFile: SourceFile;
        return transformSourceFile;

        /**
         * Transform Relay-specific syntax in a SourceFile.
         *
         * @param node A SourceFile node.
         */
        function transformSourceFile(node: SourceFile) {
            if (isDeclarationFile(node)) {
                return node;
            }

            currentSourceFile = node;
            node = visitEachChild(node, visitor, context);
            currentSourceFile = undefined;
            return node;
        }

        function visitor(node: Node): VisitResult<Node> {
            if (node.transformFlags & TransformFlags.Relay) {
                return visitorWorker(node);
            }
            else if (node.transformFlags & TransformFlags.ContainsRelay) {
                return visitEachChild(node, visitor, context);
            }
            else {
                return node;
            }
        }

        function visitorWorker(node: Node): VisitResult<Node> {
            switch (node.kind) {
                case SyntaxKind.TaggedTemplateExpression:
                    const tag = (<TaggedTemplateExpression>node).tag
                    if (tag.kind !== SyntaxKind.PropertyAccessExpression) {
                        return node;
                    }
                    const pae = <PropertyAccessExpression>tag;
                    if (pae.expression.kind !== SyntaxKind.Identifier || (<Identifier>pae.expression).text !== "Relay" || pae.name.text !== "QL") {
                        return node;
                    }

                    const schemaPath = getNormalizedAbsolutePath(context.getCompilerOptions().relaySchema, context.getEmitHost().getCurrentDirectory());
                    const schemaData = JSON.parse(sys.readFile(schemaPath));
                    const getBabelRelayPlugin = require('babel-relay-plugin');
                    let v = getBabelRelayPlugin(schemaData)({types: {
                        identifier(text: string) {
                            return createIdentifier(text);
                        },
                        valueToNode(value: string | number | boolean) {
                            return createLiteral(value);
                        },
                        newExpression(expression: Expression, arguments: Expression[]) {
                            return createNew(expression, null, arguments);
                        },
                        throwStatement(expression: Expression) {
                            return createThrow(expression);
                        },
                        blockStatement(statements: Statement[]) {
                            return createBlock(statements)
                        },
                        functionExpression(name: string, parameters: ParameterDeclaration[], body: Block) {
                            return createFunctionExpression(null, null, name, null, parameters, null, body);
                        },
                        callExpression(expression: Expression, arguments: Expression[]) {
                            return createCall(expression, null, arguments);
                        },
                        arrayExpression(elements: Expression[]) {
                            return createArrayLiteral(elements);
                        },
                        nullLiteral() {
                            return createNull();
                        },
                        objectExpression(properties: ObjectLiteralElementLike[]) {
                            return createObjectLiteral(properties);
                        },
                        objectProperty(name: string, initializer: Expression) {
                            return createPropertyAssignment(name, initializer);
                        },
                        memberExpression(target: Expression, memberName: PropertyName) {
                            return createMemberAccessForPropertyName(target, memberName);
                        },
                        returnStatement(expression: Expression) {
                            return createReturn(expression);
                        },
                    }}).visitor;

                    let output = node;
                    let path = {
                        node: toBabelAST(node),
                        replaceWith(o: Node) {
                            output = o;
                        },
                        get() { return { matchesPattern: () => true }; }, // fake to skip check
                    };
                    let state = {
                        file: {
                            opts: {
                                filename: currentSourceFile.fileName,
                                basename: getBaseFileName(currentSourceFile.fileName),
                            },
                        },
                    };
                    v.Program({parent: {}}, state);
                    v.TaggedTemplateExpression(path, state);

                    return output;
                default:
                    Debug.failBadSyntaxKind(node);
                    return undefined;
            }
        }

        function toBabelAST(node: Node): any {
            switch (node.kind) {
                case SyntaxKind.TaggedTemplateExpression:
                    return {
                        type: "TaggedTemplateExpression",
                        start: node.pos,
                        end: node.end,
                        tag: toBabelAST((<TaggedTemplateExpression>node).tag),
                        quasi: toBabelAST((<TaggedTemplateExpression>node).template),
                    };
                
                case SyntaxKind.NoSubstitutionTemplateLiteral:
                    return {
                        type: "TemplateLiteral",
                        start: node.pos,
                        end: node.end,
                        expressions: [],
                        quasis: [{
                            type: "TemplateElement",
                            start: node.pos + 1,
                            end: node.end - 1,
                            value: {
                                cooked: (<NoSubstitutionTemplateLiteral>node).text, 
                            },
				            "tail": true,
                        }],
                    };

                case SyntaxKind.TemplateExpression:
                    let templ = (<TemplateExpression>node);
                    let expressions: any[] = [];
                    let quasis: any[] = [];
                    quasis.push(toBabelAST(templ.head));
                    templ.templateSpans.forEach((span) => {
                        expressions.push(span.expression); // expressions are passed through as TS nodes
                        quasis.push(toBabelAST(span.literal));                        
                    });
                    return {
                        type: "TemplateLiteral",
                        start: node.pos,
                        end: node.end,
                        expressions: expressions,
                        quasis: quasis,
                    };
                
                case SyntaxKind.TemplateHead:
                case SyntaxKind.TemplateMiddle:
                case SyntaxKind.TemplateTail:
                    return {
                        type: "TemplateElement",
                        start: node.pos,
                        end: node.end,
                        value: {
                            cooked: (<LiteralLikeNode>node).text, 
                        },
                        "tail": node.kind === SyntaxKind.TemplateTail,
                    };

                case SyntaxKind.PropertyAccessExpression:
                    return {
                        type: "MemberExpression",
                        start: node.pos,
                        end: node.end,
                        object: toBabelAST((<PropertyAccessExpression>node).expression),
                        property: toBabelAST((<PropertyAccessExpression>node).name),
                        computed: false,
                    };

                case SyntaxKind.Identifier:
                    return {
                        type: "Identifier",
                        start: node.pos,
                        end: node.end,
                        name: (<Identifier>node).text,
                    };

                default:
                    Debug.failBadSyntaxKind(node);
                    return undefined;
            }
        }
    }
}