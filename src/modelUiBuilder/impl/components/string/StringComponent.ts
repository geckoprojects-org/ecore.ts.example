import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";
import VStringComponent from "@/modelUiBuilder/impl/components/string/VStringComponent.vue";
import type {Component} from "vue";
import type {EStructuralFeature} from "@/ecore";
import {isEAttribute} from "@/ecore";



export class StringComponent implements ComponentDescribtorI{
    component:Component =  VStringComponent;

    can_handle_EObjet(eobj: EStructuralFeature): boolean {
        if(!eobj.eType) return false;
        if(!isEAttribute(eobj)) return false;
        return eobj.eType.name == 'EString';
    }

}
