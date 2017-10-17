// Angular core
import { Component, OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Input, Output } from '@angular/core';

// Interfaces
import { CriticalInfrastructureLayer } from '../interfaces/interfaces';

// Services
import { DataService } from '../services/data.service';
import { OgreService } from '../services/ogre.service';

// 3rd Party
import { MaterializeDirective } from 'angular2-materialize';
import { Subscription } from 'rxjs/Rx';
import { Layer } from 'leaflet';
declare var $: JQueryStatic;

@Component({
    selector: 'app-fileupload',
    templateUrl: './fileupload.component.html',
    styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent implements OnInit {

    @Output() getFile = new EventEmitter();

    // @ViewChild(FilebuttonComponent) fileButtonComponent: FilebuttonComponent;

    showWindow: boolean;

    private featureTypes: string[];
    private _file: File;
    public ciLayer: CriticalInfrastructureLayer;
    private toggleProgress: boolean;
    private statusMsg: Error;
    private toggleError: boolean;
    private toggleSuccess: boolean;
    private ogreSubscription: Subscription;

    constructor(private dataService: DataService, private ogreService: OgreService) {
        this.showWindow = false;
        this.toggleError = false;
        this.toggleSuccess = false;
        this.toggleProgress = false;
        this.featureTypes = dataService.getFeatureTypes();
        //initial empty instance needed for ngModel binding.
        this.ciLayer = {
            layerName: "",
            humanName: "",
            featureType: "",
            fileUrl: "",
            visible: true
        };

    }

    ngOnInit() {
        console.log("ngOnInit() called");
    }

    ngOnChanges() {
        console.log("ngOnChanges() called");
    }

    /**
     * work-around to stop double caret elements from showing up.
     */
    ngAfterViewChecked() {
        var caret = $('.caret');
        if (caret.length >= 1) {
            console.log("length is >= 1")
            caret.css('border-color', 'transparent');
        }
    }

    toSlug() {
        this.ciLayer.layerName = this.ciLayer.humanName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase();
    }

    onCancelClick() {
        // cancel the subscription to the observable if not already canceled.
        // changed .isUnsubscribed to .closed to remove error
        if (this.ogreSubscription) {
            if (!this.ogreSubscription.closed)
                this.ogreSubscription.unsubscribe();
        }
        //hide submission window, error/alert status and progress 
        this.showWindow = false;
        this.toggleError = false;
        this.toggleProgress = false;
    }

    onShowClick() {
        this.showWindow = true;
        $('span.caret').css("border-color", "transparent");
    }

    private createNewCriticalInfrastructureLayer(): CriticalInfrastructureLayer {
        let ciLayer: CriticalInfrastructureLayer = {
            layerName: this.ciLayer.layerName,
            humanName: this.ciLayer.humanName,
            featureType: this.ciLayer.featureType,
            fileUrl: "",
            visible: true
        };
        return ciLayer;
    }

    /**
     * 
     */
    onGetFile(file: File) {
        this._file = file;
        this.toggleError = false;
        this.toggleSuccess = false;
        this.enableSubmitButton();
    }

    onSubmitFile(event: Event) {
        //show file upload progress
        this.toggleProgress = true;
        // disable file select and submit buttons
        // this.disableSelectFile();
        this.disableSubmitButton();
        this.disableSelectFeatureClass();
        this.ogreSubscription = this.ogreService.convert(this._file).subscribe(
            data => {
                this.onFileProcessed(data);
            },
            error => {
                this.onError(error);
                this.toggleProgress = false;
                // this.enableSelectFile();
                this.enableSelectFeatureClass();
            },
            () => {
                console.log("file converted by ogre service")
                //hide file upload progress
                this.toggleProgress = false;
                this.toggleSuccess = true;
                this.statusMsg = new Error("File converted successfully.");
                // this.enableSelectFile();
                this.enableSelectFeatureClass();
            }
        );
    }

    /**
    * Used to propegate processed uploaded geoJSON as L.ILayer event up component tree to App Component
    */
    onFileProcessed(uploadedLayer: Layer) {
        console.log("passing uploaded data from fileupload to parent component");
        // change ciLayer to have the uploaded feature data
        this.ciLayer = this.createNewCriticalInfrastructureLayer();
        this.ciLayer.layerData = uploadedLayer;
        this.ciLayer.fileUrl = String(Math.round(+new Date() / 1000)) + ".upload";
        console.log("fileUrl set to " + this.ciLayer.fileUrl);
        this.getFile.emit(this.ciLayer);
        // set ciLayer to new instance for next Layer
        // property 
        this.ciLayer = this.createNewCriticalInfrastructureLayer();
    }

    onError(error: Error) {
        this.toggleError = true;
        this.statusMsg = error;
        this.disableSubmitButton();
    }

    /**
     * Enables submit button, used for events or condition when submiting a file to the ogre service is permissable
     */
    private enableSubmitButton() {
        $('#file-upload-submit-button').removeClass('disabled');
    }

    /**
     * Disables submit button, used for events or condition when the submit button shouldn't be available
     */
    private disableSubmitButton() {
        $('#file-upload-submit-button').addClass('disabled');
    }


    /**
     * Disables file select button, used for events or condition when the submit button shouldn't be available
     */
    // private disableSelectFile() {
    //     this.fileButtonComponent.disable();
    // }

    /**
     * Enables file select button, used for conditions when file select is permissable
     */
    // private enableSelectFile() {
    //     this.fileButtonComponent.enable();
    // }

    /**
     * Disables feature select dropdown, used for conditions when feature class shouldn't be selectable
     */
     private disableSelectFeatureClass() {
         $("#select-feature-class").prop('disabled', true);
        // need to call material select on materialized controls when changing properties
         $("#select-feature-class").material_select();
    }

    /**
     * Enables feature select dropdown,  used for conditions when feature class is permissable
     */
    private enableSelectFeatureClass() {
        $("#select-feature-class").prop('disabled', false);
        // need to call material select on materialized controls when changing properties
        $("#select-feature-class").material_select();
    }

}
