import { RxDatabase, RxCollection, RxStorage, createRxDatabase, RxJsonSchema } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { IKeyValueDatabaseConnector, IDatabaseLayout, IDatabaseTableLayout, IValueType, IKeyValueDatabaseTableConnector } from "@crewdle/web-sdk-types";
import { transformToRxDBSchemas } from "helpers";
import { RxDBDatabaseTableConnector } from "models/RxDBDatabaseTableConnector";


/**
 * The RxDB key-value database connector - Connect to an RxDB database.
 * @category Connector
 */
export class RxDBDatabaseConnector implements IKeyValueDatabaseConnector {
  private db?: RxDatabase;
  private collections: { [tableName: string]: RxCollection } = {};
  private options?: { storage: RxStorage<unknown, unknown> };

  constructor(
    private readonly dbKey: string,
    private readonly layout: IDatabaseLayout,
  ) {}

  /**
   * Opens the database and initializes collections based on the layout.
   * @param migration The migration to apply to the database.
   * @returns A promise that resolves when the database is opened.
   */
  async open(): Promise<void> {
    this.db = await createRxDatabase({
      name: this.dbKey,
      storage: this.getStorage(),
    });

    const rxdbSchemas = transformToRxDBSchemas(this.layout);

    const collectionsToAdd: Record<string, { schema: RxJsonSchema<IDatabaseTableLayout> }> = {};
    Object.entries(rxdbSchemas).forEach(([tableName, schema]) => {
      collectionsToAdd[tableName] = { schema };
    });

    const addedCollections = await this.db.addCollections(collectionsToAdd);

    Object.keys(rxdbSchemas).forEach((tableName) => {
      this.collections[tableName] = addedCollections[tableName];
    });
  }

  /**
   * Closes the database.
   * @returns A promise that resolves when the database is closed.
   */
  async close(): Promise<void> {
    await this.db?.destroy();
    this.collections = {};
  }

  /**
   * Checks if the table exists.
   * @param tableName The name of the table.
   * @returns True if the table exists, false otherwise.
   */
  hasTable(tableName: string): boolean {
    return !!this.collections[tableName];
  }

  /**
   * Table creation should be done during DB initialization. RxDB does not support creating tables dynamically.
   * @throws Error if the table does not exist in the layout.
   */
  createTable(tableName: string): void {
    if (!this.hasTable(tableName)) {
      throw new Error(`Table ${tableName} is not predefined and cannot be created dynamically.`);
    }
  }

  /**
   * Gets a table connector.
   * @param tableName The name of the table.
   * @returns The table connector.
   */
  getTableConnector<T extends IValueType>(tableName: string): IKeyValueDatabaseTableConnector<T> {
    if (!this.hasTable(tableName)) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    return new RxDBDatabaseTableConnector<T>(this.collections[tableName]);
  }

  private getStorage(): RxStorage<unknown, unknown> {
    if (!this.options?.storage) {
      this.options = {
        storage: getRxStorageDexie(),
      };
    }

    return this.options.storage;
  }

}
