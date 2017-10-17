import { Component } from '@angular/core';

@Component({
    selector: 'app-iconselector',
    templateUrl: './iconselector.component.html',
    styleUrls: ['./iconselector.component.css']
})
export class IconselectorComponent {

    private firstRowColors: String[];
    private secondRowColors: String[];
    private thirdRowColors: String[];

    constructor() {
        this.firstRowColors = [
            "#F4EB37",
            "#CDDC39",
            "#62AF44",
            "#009D57",
            "#0BA9CC",
            "#4186F0",
            "#3F5BA9",
            "#7C3592",
            "#A61B4A",
            "#DB4436",
            "#F8971B",
            "#F4B400",
            "#795046"
        ]

        this.secondRowColors = [
            "#F9F7A6",
            "#E6EEA3",
            "#B7DBAB",
            "#7CCFA9",
            "#93D7E8",
            "#9FC3FF",
            "#A7B5D7",
            "#C6A4CF",
            "#D698AD",
            "#EE9C96",
            "#FAD199",
            "#FFDD5E",
            "#B29189"
        ]

        this.thirdRowColors = [
            "#FFFFFF",
            "#CCCCCC",
            "#777777",
            "#000000"
        ]
    }
}
