import { Component, OnInit } from '@angular/core';
import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

// 3rd Party
declare var $: JQueryStatic;

@Component({
    selector: 'app-filebutton',
    templateUrl: './filebutton.component.html',
    styleUrls: ['./filebutton.component.css']
})
export class FilebuttonComponent {

    @Output() getFile = new EventEmitter();
    @Output() error = new EventEmitter();

    private theFile: File;
    private fileType: string;
    private validFile: boolean;
    private fileJSON: L.GeoJSON;

    constructor() {

    }

    onClick() {
        $('#file-upload-button').trigger('click');
    }

    // chaning evt to any for now instead of event
    // target.files property does exist but event typing
    // doesn't account for it.
    onFile(evt: any) {
        this.theFile = evt.target.files[0];

        /* reference to OgreService observer and callback originally was here but now is in the FileUploadComponent */

        this.fileType = this.getFileType();
        this.validFile = this.isValid();
        console.log(this.theFile.name + " is a file of type " + this.fileType + ", is being uploaded, and is it valid? " + this.validFile);
        if (this.validFile) {
            this.onGetFile();
        }
        else {
            var error: Error = { name: 'Not a valid file', message: 'file must end with .zip or .geojson extension' };
            this.onError(error);
        }

    }

    /**
    * Used to pass file object to FileUploadComponent for submission to OgreService
    */
    onGetFile() {
        console.log("passing file to FileUploadComponent");
        this.getFile.emit(this.theFile);
    }

    isValid() {
        return (this.fileType === "geojson" || this.fileType === "shp" || this.fileType === "zip");
    }

    getFileType() {
        return this.theFile.name.substring(this.theFile.name.lastIndexOf(".") + 1, this.theFile.name.length);
    }

    onError(error: Error) {
        console.error(error);
        this.error.emit(error);
    }

    disable() {
        $('#file-select-button').addClass('disabled');
    }

    enable() {
        $('#file-select-button').removeClass('disabled');
    }

}
