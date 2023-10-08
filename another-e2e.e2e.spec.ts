import puppeteer, { Page, Browser } from 'puppeteer';
import 'dotenv/config'

let browser: Browser;
let page: Page;

// convert 'true' or 'false' to boolean
const useHeadless: boolean = process?.env?.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true' ? false : true

const puppeteerArgs = [
  `--disable-extensions-except=${__dirname}/dist`,
  `--load-extension=${__dirname}/dist`,
  '--disable-features=DialMediaRouteProvider',
  '--no-sandbox',
];

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: useHeadless ? 'new' : false, // Set to true for headless mode
    slowMo: 20,
    executablePath: useHeadless === false ? process.env.PUPPETEER_EXEC_PATH : undefined,
    args: puppeteerArgs,
    devtools: true,
  });
  page = await browser.newPage();
  await page.goto('https://www.google.com'); // Navigate to a common URL for all tests
});

afterAll(async () => {
  await browser.close();
});

// helper function to get extension id
const getExtensionId = async (browser: Browser) => {
  
  const targets = await browser?.targets()

  if (!browser || !targets) {
    throw new Error('No browser or targets found')
  }

  const extensionTarget = targets.find(
    (target: { type: () => string }) => target.type() === 'service_worker'
  )
  if (!extensionTarget) {
    throw new Error('No matching service worker found')
  }
  const partialExtensionUrl = extensionTarget.url() || ''
  const [, , extensionId] = partialExtensionUrl.split('/')

  return extensionId
}


describe('Extensions Tests', () => {
  it('manifest version', async () => {
    const extensionId = await getExtensionId(browser)
    const manifestUrl = `chrome-extension://${extensionId}/manifest.json`

    if (!page) {
      throw new Error('No page found')
    }

    await page.goto(manifestUrl)

    // check manifest version 3
    const manifest = await page.evaluate(() => {
      return JSON.parse(document.querySelector('body')?.innerText || '{}')
    })

    console.log('Manifest: ', manifest)

    expect(manifest.manifest_version).toEqual(3)

  });

  it('another test', async () => {
    // Another test using the same 'page' instance

    // check manifest contains host_permissions for api.mixpanel.com
    const extensionId = await getExtensionId(browser)

    const manifestUrl = `chrome-extension://${extensionId}/manifest.json`

    if (!page) {
      throw new Error('No page found')
    }

    await page.goto(manifestUrl)

    // check manifest version 3
    const manifest = await page.evaluate(() => {
      return JSON.parse(document.querySelector('body')?.innerText || '{}')
    })

    expect(JSON.stringify(manifest.host_permissions)).toContain('api.mixpanel.com/*')
  });
});
