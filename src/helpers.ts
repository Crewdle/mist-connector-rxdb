import { IDatabaseLayout, IDatabaseTableQuery } from "@crewdle/web-sdk-types";
import { RxJsonSchema } from "rxdb";

/**
 * Transforms a database layout into RxDB schemas.
 * @param layout The database layout.
 * @returns A record of RxDB schemas.
 */
export function transformToRxDBSchemas(layout: IDatabaseLayout): Record<string, RxJsonSchema<any>> {
  const rxdbSchemas: Record<string, RxJsonSchema<any>> = {};

  for (const [tableName, tableLayout] of Object.entries(layout.tables)) {
    const primaryKey = "id";

    const indexes = tableLayout.indexes?.map(index => index.keyPath) || [];

    // You might need to populate `properties` based on your specific data model.
    // This example assumes an empty `properties` object.
    const properties: { [key: string]: { type: string } } = {};
    for (const index of indexes) {
      properties[index] = { type: "string" };
    };

    properties[primaryKey] = { type: "string" };

    const schema: RxJsonSchema<any> = {
      title: tableName,
      version: layout.version,
      type: "object",
      properties,
      primaryKey,
      indexes
    };

    rxdbSchemas[tableName] = schema;
  }

  return rxdbSchemas;
}



/**
 * Transforms a where clause into a Mango query compatible with RxDB.
 * Supports various comparison operators for filtering documents.
 * @param whereClause The where clause defining the filter conditions.
 * @returns A Mango query object.
 * @throws Error if an unsupported operator is encountered.
 */

export function transformWhereClause(whereClause: IDatabaseTableQuery['where']): any {
  if (!whereClause) {
    return {};
  }

  switch (whereClause.operator) {
    case '==':
      return { [whereClause.key]: { $eq: whereClause.value } };
    case '!=':
      return { [whereClause.key]: { $ne: whereClause.value } };
    case '>':
      return { [whereClause.key]: { $gt: whereClause.value } };
    case '<':
      return { [whereClause.key]: { $lt: whereClause.value } };
    case '<=':
      return { [whereClause.key]: { $lte: whereClause.value } };
    case '>=':
      return { [whereClause.key]: { $gte: whereClause.value } };
    case 'in':
      return { [whereClause.key]: { $in: whereClause.value } };
    case 'not-in':
      return { [whereClause.key]: { $nin: whereClause.value } };
    case 'between':
      // Assuming whereClause.value is already a tuple [lowerBound, upperBound]
      return { [whereClause.key]: { $gte: whereClause.value[0], $lte: whereClause.value[1] } };
    default:
      throw new Error(`Unsupported operator`);
  }
}
