import * as sqlite3 from 'sqlite3'
import {open, Database} from 'sqlite'
import {existsSync, mkdirSync, writeFileSync, readFileSync} from 'fs'
import {dirname} from 'path'
import {resolve} from 'app-root-path'

export default class LocalDb {
  static db: Database;

  /**
   * Connect to a local db
   * @param {string} filePath The local db path
   */
  static async connect(filePath: string): Promise<Database> {
    const dirPath = dirname(filePath)
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, {recursive: true})
    }

    if (!existsSync(filePath)) {
      writeFileSync(filePath, '')
    }

    const db = await open({
      filename: filePath,
      driver: sqlite3.cached.Database,
    })

    LocalDb.db = db
    await LocalDb.init()

    return LocalDb.db
  }

  static async init(): Promise<void> {
    const initialized = await LocalDb.db.get(
      'SELECT count(*) as tables FROM sqlite_master WHERE name != ?',
      'sqlite_sequence'
    )

    if (initialized.tables) {
      return
    }

    const dump = readFileSync(resolve('/external/database.sql'))
    await LocalDb.db.run(dump.toString('utf-8'))
  }

  static async close(): Promise<void> {
    await LocalDb.db.close()
  }
}
