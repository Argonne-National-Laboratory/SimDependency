import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FilebuttonComponent } from './filebutton/filebutton.component';
import { FileuploadComponent } from './fileupload/fileupload.component';
import { LayerComponent } from './layer/layer.component';
import { LayerlistComponent } from './layer/layerlist.component';
import { MapComponent } from './map/map.component';
import { IconselectorComponent } from './iconselector/iconselector.component';
import { MarkerComponent } from './marker/marker.component';
import { NavigatorComponent } from './navigator/navigator.component';

import { CriticalinfrastructurelayerService } from './services/criticalinfrastructurelayer.service';
import { DataService } from './services/data.service';
import { FileparserService } from './services/fileparser.service';
import { GeocodingService } from './services/geocoding.service';
import { MapService } from './services/map.service';
import { Neo4jService } from './services/neo4j.service';
import { OgreService } from './services/ogre.service';
import { LayerDirective } from './layer/layer.directive';

import { MaterializeModule } from 'angular2-materialize';

@NgModule({
  declarations: [
    AppComponent,
    FilebuttonComponent,
    FileuploadComponent,
    LayerComponent,
    LayerlistComponent,
    MapComponent,
    IconselectorComponent,
    MarkerComponent,
    NavigatorComponent,
    LayerDirective,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterializeModule
  ],
  providers: [
    CriticalinfrastructurelayerService,
    DataService,
    FileparserService,
    GeocodingService,
    MapService,
    Neo4jService,
    OgreService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
