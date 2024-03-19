import { RxCollection, RxJsonSchema } from 'rxdb';
import type { IValueType, IDatabaseTableQuery, IKeyValueDatabaseConnector, IKeyValueDatabaseTableConnector, IDatabaseLayout } from '@crewdle/web-sdk';
/**
 * The RxDB key-value database connector - Connect to an RxDB database.
 * @category Connector
 */
export declare class RxDBDatabaseConnector implements IKeyValueDatabaseConnector {
    private readonly dbKey;
    private readonly layout;
    private db?;
    private collections;
    constructor(dbKey: string, layout: RxJsonSchema<IDatabaseLayout>);
    /**
     * Opens the database and initializes collections based on the layout.
     */
    open(): Promise<void>;
    /**
     * Closes the database.
     */
    close(): Promise<void>;
    /**
     * Checks if the table exists.
     */
    hasTable(tableName: string): boolean;
    createTable(tableName: string): void;
    /**
     * Gets a table connector.
     */
    getTableConnector<T extends IValueType>(tableName: string): IKeyValueDatabaseTableConnector<T>;
}
/**
 * The RxDB database table connector - Connect to a collection in an RxDB database.
 */
export declare class RxDBDatabaseTableConnector<T extends IValueType> implements IKeyValueDatabaseTableConnector<T> {
    private readonly collection;
    constructor(collection: RxCollection<T>);
    /**
     * Gets a value.
     */
    get(key: string): Promise<T | undefined>;
    /**
     * Sets a value.
     */
    set(key: string, value: Omit<T, 'id'>): Promise<T>;
    /**
     * Adds a value. The key will be generated.
     */
    add(value: Omit<T, 'id'>): Promise<T>;
    /**
     * Deletes a value.
     */
    delete(key: string): Promise<void>;
    /**
     * Clears the collection.
     */
    clear(): Promise<void>;
    /**
     * Lists values based on a query.
     */
    list(query?: IDatabaseTableQuery): Promise<T[]>;
    /**
     * Counts values based on a query.
     */
    count(query?: IDatabaseTableQuery): Promise<number>;
    /**
    * Calculates the approximate size of the collection by summing the sizes of the stringified documents.
    * @returns A promise that resolves with the size in bytes.
    */
    calculateSize(): Promise<number>;
}
