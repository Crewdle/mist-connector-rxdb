import { IDatabaseLayout } from '@crewdle/web-sdk';
import { RxDBDatabaseConnector } from 'models/RxDBDatabaseConnector';
import { addRxPlugin, RxStorage } from 'rxdb';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);

export interface IRxDBOptions {
  storage?: RxStorage<unknown, unknown>;
}

export function getRxDBDatabaseConnector(options?: IRxDBOptions) {
  if (!options) {
    return RxDBDatabaseConnector;
  }
  return class RxDBDatabaseConnectorWithInjectedOptions extends RxDBDatabaseConnector {
    constructor(dbKey: string, layout: IDatabaseLayout) {
      super(dbKey, layout);
      options && Object.assign(this, options);
    }
  };
}

export { RxDBDatabaseConnector } from 'models/RxDBDatabaseConnector';
export { RxDBDatabaseTableConnector } from 'models/RxDBDatabaseTableConnector';
