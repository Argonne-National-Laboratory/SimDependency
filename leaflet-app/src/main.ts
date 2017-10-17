import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

// hacky way to make extentions to leaflet not 
// handled by module loading recognized  

// import * as L from 'leaflet';
// window['L'] = require('leaflet');
// window['$'] = require('jquery');


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
