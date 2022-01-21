import * as assert from 'assert';

Feature('search');

const openSearchLocator = { css: 'div[aria-label="Open search"]' };
const searchBarLocator = { css: 'input[aria-label="Search"]' };
const emptySearchPrompt = 'Type something in the search box to start searching';
const clearSearchLocator = { css: 'div[aria-label="Clear search"]' };
const closeSearchLocator = { css: 'div[aria-label="Close search"]' };

Before(({I}) => {
  I.amOnPage('http://localhost:8080');
  verifyOnHomePage(I);
});

Scenario('Opening / activating search bar stays on home page', async ({ I }) => {
  await openSearch(I);

  verifyOnHomePage(I);

  I.seeElement(searchBarLocator);

  assert.strictEqual('Search...', await I.grabAttributeFrom(searchBarLocator, 'placeholder'));

  // Search bar is empty by default
  assert.strictEqual('', await I.grabValueFrom(searchBarLocator));
});

Scenario('Closing search return to original page (@mobile-only)', async ({ I }) => {
  const url = 'http://localhost:8080/m/8pN9r7vd/elephants-dream';
  const title = 'Elephants Dream';

  I.amOnPage(url);
  I.see(title);

  await openSearch(I);

  I.seeCurrentUrlEquals(url);

  I.seeElement(searchBarLocator);
  I.fillField(searchBarLocator, 'Test');
  I.seeCurrentUrlEquals('http://localhost:8080/q/Test');
  I.dontSee(title);

  I.fillField(searchBarLocator, 'HelloWorld');
  I.seeCurrentUrlEquals('http://localhost:8080/q/HelloWorld');
  I.dontSee(title);

  I.click(closeSearchLocator);
  I.seeCurrentUrlEquals(url);
  I.see(title);
});

Scenario('I can type a search phrase in the search bar', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'Caminandes');
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, ['Caminandes 1', 'Caminandes 2', 'Caminandes 3']);

  I.click(clearSearchLocator);
  assert.strictEqual('', await I.grabValueFrom(searchBarLocator));

  checkSearchResults(I, []);
  I.see(emptySearchPrompt);
});

Scenario('I can search by partial match', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'ani');
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, ['Minecraft Animation Workshop', 'Animating the Throw', 'Primitive Animals']);
});

Scenario('I get empty search results when no videos match', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'Axdfsdfgfgfd');
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, []);

  I.see('No results found for "Axdfsdfgfgfd"');
  I.see('Suggestions:');
  I.see('Make sure all words are spelled correctly');
  I.see('Make search terms more general');
  I.see('Try different search terms');

  I.dontSee(emptySearchPrompt);
});

Scenario('The search URL is encoded', async({ I }) => {
  await openSearch(I);

  I.fillField(searchBarLocator, 'Hello/World! How are you? 這是中國人');
  I.seeCurrentUrlEquals('http://localhost:8080/q/Hello%2FWorld!%20How%20are%20you%3F%20%E9%80%99%E6%98%AF%E4%B8%AD%E5%9C%8B%E4%BA%BA')
});

Scenario('I can clear the search phrase with the clear button', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'Hello');
  I.seeElement(clearSearchLocator);
  I.click(clearSearchLocator);

  I.see(emptySearchPrompt);
  I.dontSee('No results found');
  I.dontSee('Suggestions:');

  I.waitForValue(searchBarLocator, '', 0);
});

Scenario('I can clear the search phrase manually', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'Hello');
  I.seeElement(clearSearchLocator);
  I.click(searchBarLocator);
  I.pressKey(['Control', 'a']);
  I.pressKey('Backspace');

  I.see(emptySearchPrompt);
  I.dontSee('No results found');
  I.dontSee('Suggestions:');
});

function checkSearchResults(I: CodeceptJS.I, expectedResults: string[]) {
  I.dontSee('Blender Channel');
  I.dontSee('All Films');

  if (expectedResults.length > 0) {
    I.see('Search results');
    I.dontSee(emptySearchPrompt);
    I.dontSee('No results found');
    expectedResults.forEach(result => I.see(result));

  } else {
    I.dontSee('Search results');
    I.dontSeeElement('div[class*="cell"]');
    I.dontSeeElement('div[class*="card"]');
    I.dontSeeElement('div[class*="poster"]');
  }
}

function verifyOnHomePage(I: CodeceptJS.I) {
  I.see('Blender Channel');
  I.see('All Films');

  I.dontSee('No results found');
  I.dontSee(emptySearchPrompt);
  I.dontSee('Search results');
}

async function openSearch(I: CodeceptJS.I) {
  if (await I.isMobile()) {
    I.dontSee(searchBarLocator);
    I.click(openSearchLocator);
  }

  I.seeElement(searchBarLocator);
}
