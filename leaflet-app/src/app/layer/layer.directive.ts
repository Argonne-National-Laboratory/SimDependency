// Angular Core
import { Directive } from '@angular/core';
import { HostBinding, HostListener } from '@angular/core';
import { Input } from '@angular/core';

@Directive({
    selector: '[mwLayer]'
})
export class LayerDirective {

    @HostBinding('class.is-layer') isLayer = true;
    @HostBinding('class.is-layer-hovering') hovering = false;

    @HostListener('mouseenter')
    onMouseEnter() {
        this.hovering = true;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.hovering = false;
    }

    @Input()
    set mwLayer(value: boolean) {
        this.isLayer = value;
    }
}
