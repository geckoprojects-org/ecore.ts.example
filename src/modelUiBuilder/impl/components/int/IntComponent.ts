import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";
import type {Component} from "vue";
import type {EStructuralFeature} from "@/ecore";
import {isEAttribute} from "@/ecore";
import VIntComponent from "@/modelUiBuilder/impl/components/int/VIntComponent.vue";



export class IntComponent implements ComponentDescribtorI{
    component:Component =  VIntComponent;

    can_handle_EObjet(eobj: EStructuralFeature): boolean {
        if(!eobj.eType) return false;
        if(!isEAttribute(eobj)) return false;
        return eobj.eType.name == 'EInt';
    }

}
