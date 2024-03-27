import type { obj } from './utils';

/** Format of introspection data queryied from your schema.
 *
 * @remarks
 * You must provide your introspected schema in the standard introspection
 * format (as represented by this type) to `setupSchema` to configure this
 * library to use your types.
 *
 * @see {@link setupSchema} for where to use this data.
 */
export interface IntrospectionQuery {
  readonly __schema: IntrospectionSchema;
}

interface IntrospectionSchema {
  readonly queryType: IntrospectionNamedTypeRef;
  readonly mutationType?: IntrospectionNamedTypeRef | null;
  readonly subscriptionType?: IntrospectionNamedTypeRef | null;
  /* Usually this would be:
    | IntrospectionScalarType
    | IntrospectionObjectType
    | IntrospectionInterfaceType
    | IntrospectionUnionType
    | IntrospectionEnumType
    | IntrospectionInputObjectType;
    However, this forces TypeScript to evaluate the type of an
    entire introspection query, rather than accept its shape as-is.
    So, instead, we constrain it to `any` here.
  */
  readonly types: readonly any[];
}

interface IntrospectionScalarType {
  readonly kind: 'SCALAR';
  readonly name: string;
  readonly specifiedByURL?: string | null;
}

export interface IntrospectionObjectType {
  readonly kind: 'OBJECT';
  readonly name: string;
  // Usually this would be `IntrospectionField`.
  // However, to save TypeScript some work, instead, we constraint it to `any` here.
  readonly fields: readonly any[];
  // The `interfaces` field isn't used. It's omitted here
}

interface IntrospectionInterfaceType {
  readonly kind: 'INTERFACE';
  readonly name: string;
  // Usually this would be `IntrospectionField`.
  // However, to save TypeScript some work, instead, we constraint it to `any` here.
  readonly fields: readonly any[];
  readonly possibleTypes: readonly IntrospectionNamedTypeRef[];
  // The `interfaces` field isn't used. It's omitted here
}

interface IntrospectionUnionType {
  readonly kind: 'UNION';
  readonly name: string;
  readonly possibleTypes: readonly IntrospectionNamedTypeRef[];
}

interface IntrospectionEnumValue {
  readonly name: string;
}

interface IntrospectionEnumType {
  readonly kind: 'ENUM';
  readonly name: string;
  readonly enumValues: readonly IntrospectionEnumValue[];
}

interface IntrospectionInputObjectType {
  readonly kind: 'INPUT_OBJECT';
  readonly name: string;
  readonly inputFields: readonly IntrospectionInputValue[];
}

export interface IntrospectionListTypeRef {
  readonly kind: 'LIST';
  readonly ofType: IntrospectionTypeRef;
}

export interface IntrospectionNonNullTypeRef {
  readonly kind: 'NON_NULL';
  readonly ofType: IntrospectionTypeRef;
}

export type IntrospectionTypeRef =
  | IntrospectionNamedTypeRef
  | IntrospectionListTypeRef
  | IntrospectionNonNullTypeRef;

export interface IntrospectionNamedTypeRef {
  readonly name: string;
}

export interface IntrospectionField {
  readonly name: string;
  readonly type: IntrospectionTypeRef;
  // The `args` field isn't used. It's omitted here
}

interface IntrospectionInputValue {
  readonly name: string;
  readonly type: IntrospectionTypeRef;
  readonly defaultValue?: string | null;
}

interface DefaultScalars {
  ID: string;
  Boolean: boolean;
  String: string;
  Float: number;
  Int: number;
}

interface DefaultEnums {}

type mapEnum<T extends IntrospectionEnumType, Enums extends EnumsLike = DefaultEnums> = {
  kind: 'ENUM';
  name: T['name'];
  type: T['name'] extends keyof Enums ? Enums[T['name']] : T['enumValues'][number]['name'];
};

type mapField<T> = T extends IntrospectionField
  ? {
      name: T['name'];
      type: T['type'];
    }
  : never;

export type mapObject<T extends IntrospectionObjectType> = {
  kind: 'OBJECT';
  name: T['name'];
  fields: obj<{
    [P in T['fields'][number]['name']]: T['fields'][number] extends infer Field
      ? Field extends { readonly name: P }
        ? mapField<Field>
        : never
      : never;
  }>;
};

export type mapInputObject<T extends IntrospectionInputObjectType> = {
  kind: 'INPUT_OBJECT';
  name: T['name'];
  inputFields: [...T['inputFields']];
};

type mapInterface<T extends IntrospectionInterfaceType> = {
  kind: 'INTERFACE';
  name: T['name'];
  possibleTypes: T['possibleTypes'][number]['name'];
  fields: obj<{
    [P in T['fields'][number]['name']]: T['fields'][number] extends infer Field
      ? Field extends { readonly name: P }
        ? mapField<Field>
        : never
      : never;
  }>;
};

type mapUnion<T extends IntrospectionUnionType> = {
  kind: 'UNION';
  name: T['name'];
  fields: {};
  possibleTypes: T['possibleTypes'][number]['name'];
};

/** @internal */
type mapType<Type, Enums extends EnumsLike = DefaultEnums> = Type extends IntrospectionEnumType
  ? mapEnum<Type, Enums>
  : Type extends IntrospectionObjectType
    ? mapObject<Type>
    : Type extends IntrospectionInterfaceType
      ? mapInterface<Type>
      : Type extends IntrospectionUnionType
        ? mapUnion<Type>
        : Type extends IntrospectionInputObjectType
          ? mapInputObject<Type>
          : Type extends IntrospectionScalarType
            ? unknown
            : never;

/** @internal */
type mapIntrospectionTypes<Query extends IntrospectionQuery, Enums extends EnumsLike = DefaultEnums> = obj<{
  [P in Query['__schema']['types'][number]['name']]: Query['__schema']['types'][number] extends infer Type
    ? Type extends { readonly name: P }
      ? mapType<Type, Enums>
      : never
    : never;
}>;

/** @internal */
type mapIntrospectionScalarTypes<Scalars extends ScalarsLike = DefaultScalars> = obj<{
  [P in keyof Scalars | keyof DefaultScalars]: {
    kind: 'SCALAR';
    name: P;
    type: P extends keyof Scalars
      ? Scalars[P]
      : P extends keyof DefaultScalars
        ? DefaultScalars[P]
        : never;
  };
}>;

/** @internal */
type mapIntrospection<Query extends IntrospectionLikeInput, Enums extends EnumsLike = DefaultEnums> = Query extends IntrospectionQuery
  ? {
      query: Query['__schema']['queryType']['name'];
      mutation: Query['__schema']['mutationType'] extends { name: string }
        ? Query['__schema']['mutationType']['name']
        : never;
      subscription: Query['__schema']['subscriptionType'] extends { name: string }
        ? Query['__schema']['subscriptionType']['name']
        : never;
      types: mapIntrospectionTypes<Query, Enums>;
    }
  : Query;

type addIntrospectionScalars<
  Schema extends SchemaLike,
  Scalars extends ScalarsLike = DefaultScalars,
> = {
  query: Schema['query'];
  mutation: Schema['mutation'];
  subscription: Schema['subscription'];
  types: mapIntrospectionScalarTypes<Scalars> & Schema['types'];
};

/** Either a format of introspection data or an already preprocessed schema.
 * @see {@link IntrospectionQuery} */
export type IntrospectionLikeInput = SchemaLike | IntrospectionQuery;

export type ScalarsLike = {
  [name: string]: any;
};

export type EnumsLike = {
  [name: string]: any;
};

export type SchemaLike = {
  query: string;
  mutation?: any;
  subscription?: any;
  types: { [name: string]: any };
};

export type { mapType, mapIntrospectionTypes, mapIntrospection, addIntrospectionScalars };
