import { v4 as uuidv4 } from "uuid";
import { RxCollection, MangoQuerySortPart } from "rxdb";

import { IValueType, IKeyValueDatabaseTableConnector, IDatabaseTableQuery } from "@crewdle/web-sdk-types";
import { transformWhereClause } from "helpers";

/**
 * The RxDB database table connector - Connect to a collection in an RxDB database.
 * @category Connector
 * @typeparam T The type of the value.
 */
export class RxDBDatabaseTableConnector<T extends IValueType> implements IKeyValueDatabaseTableConnector<T> {
  constructor(private readonly collection: RxCollection<T>) {}

  /**
   * Gets a value.
   * @param key The key of the value to get.
   * @returns A promise that resolves with the value.
   */
  async get(key: string): Promise<T | undefined> {
    const doc = await this.collection.findOne(key).exec();
    return doc ? (doc.toJSON() as T) : undefined;
  }

  /**
   * Sets a value.
   * @param key The key of the value to set.
   * @param value The value to set.
   * @returns A promise that resolves with the set value.
   */
  async set(key: string, value: Omit<T, 'id'>): Promise<T> {
    await this.collection.upsert({ ...value, id: key } as T);
    return { ...value, id: key } as T;
  }

  /**
   * Adds a value. The key will be generated.
   * @param value The value to add.
   * @returns A promise that resolves with the added value.
   */
  async add(value: Omit<T, 'id'>): Promise<T> {
    const id = uuidv4();
    await this.collection.insert({ ...value, id } as T);
    return { ...value, id } as T;
  }

  /**
   * Deletes a value.
   * @param key The key of the value to delete.
   * @returns A promise that resolves when the value is deleted.
   */
  async delete(key: string): Promise<void> {
    const doc = await this.collection.findOne(key).exec();
    if (doc) {
      await doc.remove();
    }
  }

  /**
   * Clears the collection.
   * @returns A promise that resolves when the collection is cleared.
   */
  async clear(): Promise<void> {
    await this.collection.remove();
  }

  /**
   * Lists values based on a query.
   * @param query The query to filter the values.
   * @returns A promise that resolves with the list of values.
   */
  async list(query?: IDatabaseTableQuery): Promise<T[]> {
    let rxQuery = this.collection.find();

    if (query?.where) {
      const whereQuery = transformWhereClause(query.where);
      rxQuery = rxQuery.where(whereQuery);
    }

    if (query?.orderBy) {
      const sortOrder = {
        [query.orderBy.key]: query.orderBy.direction,
      } as MangoQuerySortPart<T>;
      rxQuery = rxQuery.sort(sortOrder);
    }

    if (query?.limit !== undefined) {
      rxQuery = rxQuery.limit(query.limit);
    }

    let results = await rxQuery.exec();
    if (query?.offset !== undefined) {
      results = results.slice(query.offset);
    }

    return results.map(doc => doc.toJSON()) as T[];
  }

  /**
   * Counts the number of values based on a query.
   * @param query The query to filter the values.s
   * @returns A promise that resolves with the number of values.
   */
  async count(query?: IDatabaseTableQuery): Promise<number> {
    let rxQuery = this.collection.find();

    if (query?.where) {
      const whereQuery = transformWhereClause(query.where);
      rxQuery = rxQuery.where(whereQuery);
    }

    let results = await rxQuery.exec();

    return results.length;
  }


   /**
   * Calculates the approximate size of the collection by summing the sizes of the stringified documents.
   * @returns A promise that resolves with the size in bytes.
   */
    async calculateSize(): Promise<number> {
      const allDocs = await this.collection.find().exec();
      const totalSize = allDocs.reduce((sum, doc) => {
        const docSize = new Blob([JSON.stringify(doc)]).size;
        return sum + docSize;
      }, 0);

      return totalSize;
    }
}
