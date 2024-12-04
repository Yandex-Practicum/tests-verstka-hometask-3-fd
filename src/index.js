import path from 'path';
import {
  launchBrowser,
  compareLayout,
  runTests,
  mkdir,
  mkfile,
  structure,
  stylelint,
  w3c,
  orderStyles,
  lang,
  titleEmmet,
  horizontalScroll,
} from 'lib-verstka-tests';
import ru from './locales/ru.js';
import {
  colorScheme,
  switchScheme,
  blockFullScreen,
  semanticTags,
  resetMargins,
  backgroundFixed,
} from './tests.js';

const [, , PROJECT_PATH, LANG = 'ru'] = process.argv;

const app = async (projectPath, lng) => {
  const options = {
    projectPath,
    lang: lng,
    resource: ru,
  };

  const check = async () => {
    const tree = mkdir('project', [
      mkfile('index.html'),
      mkdir('scripts', [
        mkfile('script.js'),
      ]),
      mkdir('styles', [
        mkfile('dark.css'),
        mkfile('globals.css'),
        mkfile('light.css'),
        mkfile('style.css'),
        mkfile('variables.css'),
      ]),
      mkdir('fonts', [
        mkfile('fonts.css'),
      ]),
    ]);
    const structureErrors = structure(projectPath, tree);

    if (structureErrors.length) {
      return structureErrors;
    }

    const baseUrl = 'http://localhost:3000';
    const viewport = { width: 1024, height: 768 };
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const { browser, page } = await launchBrowser(baseUrl, { launchOptions, viewport });
    const errors = (await Promise.all([
      w3c(projectPath, 'index.html'),
      stylelint(projectPath),
      orderStyles(page, ['fonts.css', 'globals.css']),
      lang(page, lng),
      titleEmmet(page),
      colorScheme(page),
      switchScheme(baseUrl),
      blockFullScreen(page, 'header'),
      blockFullScreen(page, 'footer'),
      semanticTags(page, ['header', 'main', 'section', 'footer', 'nav']),
      resetMargins(page, ['body']),
      horizontalScroll(page),
      backgroundFixed(page, '.page'),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-1024.jpg',
        pageImage: 'layout-1024.jpg',
        outputImage: 'output-1024.jpg',
        browserOptions: { launchOptions, viewport: { width: 1024, height: 768 } },
      }, {
        onBeforeScreenshot: async (p) => {
          await p.emulateMediaFeatures([
            { name: 'prefers-color-scheme', value: 'light' },
          ]);
          await p.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));
          await p.waitForTimeout(2000);
        },
      }),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-768.jpg',
        pageImage: 'layout-768.jpg',
        outputImage: 'output-768.jpg',
        browserOptions: { launchOptions, viewport: { width: 768, height: 1024 } },
      }, {
        onBeforeScreenshot: async (p) => {
          await p.emulateMediaFeatures([
            { name: 'prefers-color-scheme', value: 'light' },
          ]);
          await p.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));
          await p.waitForTimeout(2000);
        },
      }),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-375.jpg',
        pageImage: 'layout-375.jpg',
        outputImage: 'output-375.jpg',
        browserOptions: { launchOptions, viewport: { width: 375, height: 668 } },
      }, {
        onBeforeScreenshot: async (p) => {
          await p.emulateMediaFeatures([
            { name: 'prefers-color-scheme', value: 'light' },
          ]);
          await p.evaluate(() => window.scrollTo(0, document.body.clientHeight - 668 * 2));
          await p.waitForTimeout(2000);
        },
      }),
    ]))
      .filter(Boolean)
      .flat();

    await browser.close();

    return errors;
  };

  await runTests(options, check);
};

app(PROJECT_PATH, LANG);
