import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";

import type {Component} from "vue";
import type {EStructuralFeature} from "@/ecore";
import {isEAttribute} from "@/ecore";
import VBooleanComponent from "@/modelUiBuilder/impl/components/boolean/VBooleanComponent.vue";



export class BooleanComponent implements ComponentDescribtorI{
    component:Component =  VBooleanComponent;

    can_handle_EObjet(eobj: EStructuralFeature): boolean {
        if(!eobj.eType) return false;
        if(!isEAttribute(eobj)) return false;
        return eobj.eType.name == 'EBoolean';
    }

}
