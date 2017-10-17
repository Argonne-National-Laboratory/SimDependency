import { LeafletAppPage } from './app.po';

describe('leaflet-app App', function() {
  let page: LeafletAppPage;

  beforeEach(() => {
    page = new LeafletAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
