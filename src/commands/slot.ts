import LocalDb from '../inc/local-db'
import Auchan from '../inc/auchan'

import {Command, flags} from '@oclif/command'
import {sprintf} from 'sprintf-js'
import {WebClient} from '@slack/web-api'
import cli from 'cli-ux'
import * as moment from 'moment'

export default class Slot extends Command {
  static description = 'search for the next available slot in an Auchan Drive store'

  static examples = [
    `$ auchand-check slot -s 870 -p -n xxxxxxxxxxx
- Name: Aubiere / Clermont Ferrand
- Slot: Wed Apr 15 2020 12:00:00 GMT+0200
Checking slot availability for 870... done
Persisting slot in ./db/auchan-drive.db... done
Notifying slack channel xxxxxxxxxxx... done
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    storeId: flags.string({char: 's', default: '870', description: 'Id of the store to check'}),
    dbFile: flags.string({char: 'd', default: './db/auchan-drive.db', description: 'Local database file'}),
    notify: flags.string({char: 'n', description: 'Slack channel to notify'}),
    persist: flags.boolean({char: 'p', description: 'Enable persistence'}),
  }

  async run() {
    const {flags} = this.parse(Slot)

    cli.action.start(`Checking slot availability for ${flags.storeId}`)
    const {name, url, slot} = await this.checkSlot(flags.storeId as unknown as number)
    cli.action.stop()

    let changed = true
    if (flags.persist) {
      cli.action.start(`Persisting slot in ${flags.dbFile}`)
      changed = await this.persistSlot(flags.dbFile, flags.storeId as unknown as number, slot)
      cli.action.stop()
    }

    if (flags.notify && changed) {
      cli.action.start(`Notifying slack channel ${flags.notify}`)
      await this.notifySlack(flags.notify, name, url, slot)
      cli.action.stop()
    }
  }

  async checkSlot(storeId: number): Promise<{name: string|null; url: string; slot: moment.Moment|undefined}> {
    moment.locale('fr')

    const auchan = new Auchan(storeId)
    const {browser, page} = await auchan.browse()

    const name = await page.$eval('header.header .header__identity-pointOfService em', e => e.textContent)
    this.log(`- Name: ${name}`)

    const slot = await page.$eval('#cart .cart-slots__slot-content', e => e.textContent)
    await browser.close()

    if (slot === 'Aucun créneau disponible') {
      this.log('- No slot available for now')
      return {name, url: auchan.getUrl(), slot: undefined}
    }

    const slotDate = moment(slot as string, 'dddd D MMMM YYYY - HH:mm')
    this.log(`- Slot: ${slotDate}`)

    return {name, url: auchan.getUrl(), slot: slotDate}
  }

  async persistSlot(dbFile: string, storeId: number, slot: moment.Moment|undefined): Promise<boolean> {
    await LocalDb.connect(dbFile)

    const previousCall = await LocalDb.db.get(
      'SELECT date FROM slots WHERE store_id = ? ORDER BY created_at DESC LIMIT 1',
      storeId
    )

    if (previousCall && ((!slot && !previousCall.date) || (slot && slot.utc().isSame(moment.utc(previousCall.date))))) {
      return false
    }

    await LocalDb.db.run(
      'INSERT INTO slots VALUES(NULL, ?, ?, CURRENT_TIMESTAMP)',
      [
        storeId,
        (slot) ? slot.utc().format('YYYY-MM-DD HH:mm:ss') : slot,
      ]
    )

    await LocalDb.close()
    return true
  }

  async notifySlack(channelId: string, name: string|null, url: string, slot: moment.Moment|undefined): Promise<void> {
    const token = process.env.SLACK_TOKEN
    const web = new WebClient(token)

    await web.chat.postMessage({
      channel: channelId,
      as_user: true,
      text: sprintf(
        'Auchan %s - %s',
        name,
        (moment.isMoment(slot)) ? `:white_check_mark: New slot available: <${url}|${slot}>` : ':x: No slot available'
      ),
    })
  }
}
