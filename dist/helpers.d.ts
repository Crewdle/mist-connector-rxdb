import { IDatabaseLayout, IDatabaseTableQuery } from "@crewdle/web-sdk";
import { RxJsonSchema } from "rxdb";
/**
 * Transforms a database layout into RxDB schemas.
 * @param layout The database layout.
 * @returns A record of RxDB schemas.
 */
export declare function transformToRxDBSchemas(layout: IDatabaseLayout): Record<string, RxJsonSchema<any>>;
/**
 * Transforms a where clause into a Mango query compatible with RxDB.
 * Supports various comparison operators for filtering documents.
 * @param whereClause The where clause defining the filter conditions.
 * @returns A Mango query object.
 * @throws Error if an unsupported operator is encountered.
 */
export declare function transformWhereClause(whereClause: IDatabaseTableQuery['where']): any;
