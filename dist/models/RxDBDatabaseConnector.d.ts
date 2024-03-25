import { IKeyValueDatabaseConnector, IDatabaseLayout, IValueType, IKeyValueDatabaseTableConnector } from "@crewdle/web-sdk-types";
/**
 * The RxDB key-value database connector - Connect to an RxDB database.
 * @category Connector
 */
export declare class RxDBDatabaseConnector implements IKeyValueDatabaseConnector {
    private readonly dbKey;
    private readonly layout;
    private db?;
    private collections;
    private options?;
    constructor(dbKey: string, layout: IDatabaseLayout);
    /**
     * Opens the database and initializes collections based on the layout.
     * @param migration The migration to apply to the database.
     * @returns A promise that resolves when the database is opened.
     */
    open(): Promise<void>;
    /**
     * Closes the database.
     * @returns A promise that resolves when the database is closed.
     */
    close(): Promise<void>;
    /**
     * Checks if the table exists.
     * @param tableName The name of the table.
     * @returns True if the table exists, false otherwise.
     */
    hasTable(tableName: string): boolean;
    /**
     * Table creation should be done during DB initialization. RxDB does not support creating tables dynamically.
     * @throws Error if the table does not exist in the layout.
     */
    createTable(tableName: string): void;
    /**
     * Gets a table connector.
     * @param tableName The name of the table.
     * @returns The table connector.
     */
    getTableConnector<T extends IValueType>(tableName: string): IKeyValueDatabaseTableConnector<T>;
    private getStorage;
}
