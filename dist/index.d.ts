import { RxDBDatabaseConnector } from 'models/RxDBDatabaseConnector';
export interface IRxDBOptions {
    storage?: any;
}
export declare function getRxDBDatabaseConnector(options?: IRxDBOptions): typeof RxDBDatabaseConnector;
export { RxDBDatabaseConnector } from 'models/RxDBDatabaseConnector';
export { RxDBDatabaseTableConnector } from 'models/RxDBDatabaseTableConnector';
