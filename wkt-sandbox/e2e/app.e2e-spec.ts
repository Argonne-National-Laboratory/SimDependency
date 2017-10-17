import { WktSandboxPage } from './app.po';

describe('wkt-sandbox App', function() {
  let page: WktSandboxPage;

  beforeEach(() => {
    page = new WktSandboxPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
