import Decimal from 'decimal.js';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language/kinds';

export default new GraphQLScalarType({
    name: 'Decimal',
    serialize: (number : Decimal) => number.toString(),
    parseValue: (rawValue : string) => new Decimal(rawValue),
    parseLiteral: (ast) => {
        if (
            ast.kind === Kind.STRING
            || ast.kind === Kind.INT
            || ast.kind === Kind.FLOAT
        ) {
            return new Decimal((<any>ast).value);
        }
        return null;
    }
});
