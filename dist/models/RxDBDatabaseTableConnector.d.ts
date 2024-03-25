import { RxCollection } from "rxdb";
import { IValueType, IKeyValueDatabaseTableConnector, IDatabaseTableQuery } from "@crewdle/web-sdk-types";
/**
 * The RxDB database table connector - Connect to a collection in an RxDB database.
 * @category Connector
 * @typeparam T The type of the data to serialize.
 */
export declare class RxDBDatabaseTableConnector<T extends IValueType> implements IKeyValueDatabaseTableConnector<T> {
    private readonly collection;
    constructor(collection: RxCollection<T>);
    /**
     * Gets a value.
     * @param key The key of the value to get.
     * @returns A promise that resolves with the value.
     */
    get(key: string): Promise<T | undefined>;
    /**
     * Sets a value.
     * @param key The key of the value to set.
     * @param value The value to set.
     * @returns A promise that resolves with the set value.
     */
    set(key: string, value: Omit<T, 'id'>): Promise<T>;
    /**
     * Adds a value. The key will be generated.
     * @param value The value to add.
     * @returns A promise that resolves with the added value.
     */
    add(value: Omit<T, 'id'>): Promise<T>;
    /**
     * Deletes a value.
     * @param key The key of the value to delete.
     * @returns A promise that resolves when the value is deleted.
     */
    delete(key: string): Promise<void>;
    /**
     * Clears the collection.
     * @returns A promise that resolves when the collection is cleared.
     */
    clear(): Promise<void>;
    /**
     * Lists values based on a query.
     * @param query The query to filter the values.
     * @returns A promise that resolves with the list of values.
     */
    list(query?: IDatabaseTableQuery): Promise<T[]>;
    /**
     * Counts the number of values based on a query.
     * @param query The query to filter the values.s
     * @returns A promise that resolves with the number of values.
     */
    count(query?: IDatabaseTableQuery): Promise<number>;
    /**
    * Calculates the approximate size of the collection by summing the sizes of the stringified documents.
    * @returns A promise that resolves with the size in bytes.
    */
    calculateSize(): Promise<number>;
}
