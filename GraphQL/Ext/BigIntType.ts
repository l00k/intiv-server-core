import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language/kinds';


const MAX_INT = Number.MAX_SAFE_INTEGER;
const MIN_INT = Number.MIN_SAFE_INTEGER;

export default new GraphQLScalarType({
    name: 'BigInt',
    serialize: (number : BigInt) => number.toString(),
    parseValue: (rawValue : string) => BigInt(rawValue),
    parseLiteral: (ast) => {
        if (
            ast.kind === Kind.INT
            || ast.kind === Kind.STRING
        ) {
            return BigInt((<any> ast).value);
        }
        return null;
    }
});
