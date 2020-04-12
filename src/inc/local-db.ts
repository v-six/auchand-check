import * as sqlite3 from 'sqlite3'
import {open, Database} from 'sqlite'
import * as fs from 'fs'

export default class LocalDb {
  static db: Database;

  /**
   * Connect to a local db
   * @param {string} filePath The local db path
   */
  static async connect(filePath: string): Promise<Database> {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '')
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

    const dump = fs.readFileSync('./db/database.sql')
    await LocalDb.db.run(dump.toString('utf-8'))
  }

  static async close(): Promise<void> {
    await LocalDb.db.close()
  }
}
