import * as playwright from 'playwright'
import {sprintf} from 'sprintf-js'

export default class Auchan {
  static uri = 'https://www.auchandrive.fr/drive/mag/update-%s/';

  storeId: number;

  /**
   * Constructor of an Auchan
   * @param {number} storeId The auchan drive store id (found in the search form sources)
   */
  constructor(storeId: number) {
    this.storeId = storeId
  }

  /**
   * Get an Auchan Drive opened browser
   */
  async browse(): Promise<{browser: playwright.Browser; context: playwright.ChromiumBrowserContext; page: playwright.Page}> {
    const browser = await playwright.chromium.launch({
      args: ['--disable-setuid-sandbox', '--no-sandbox'],
    })

    const context = await browser.newContext({
      viewport: {width: 1440, height: 800},
    })

    context.clearCookies()

    const page = await context.newPage()
    await page.goto(sprintf(Auchan.uri, this.storeId))
    await page.waitForLoadState()

    return {browser, context, page}
  }
}
