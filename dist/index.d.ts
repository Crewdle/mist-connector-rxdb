import { RxDBDatabaseConnector } from 'models/RxDBDatabaseConnector';
import { RxStorage } from 'rxdb';
export interface IRxDBOptions {
    storage?: RxStorage<unknown, unknown>;
}
export declare function getRxDBDatabaseConnector(options?: IRxDBOptions): typeof RxDBDatabaseConnector;
export { RxDBDatabaseConnector } from 'models/RxDBDatabaseConnector';
export { RxDBDatabaseTableConnector } from 'models/RxDBDatabaseTableConnector';
