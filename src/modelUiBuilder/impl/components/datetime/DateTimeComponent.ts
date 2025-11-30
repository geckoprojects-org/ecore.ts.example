import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";
import type {Component} from "vue";

import VDatetimeComponent from "@/modelUiBuilder/impl/components/datetime/VDatetimeComponent.vue";
import type {EStructuralFeature} from "@/ecore";
import {isEAttribute} from "@/ecore";


export class DateTimeComponent implements ComponentDescribtorI{
    component:Component =  VDatetimeComponent;

    can_handle_EObjet(eobj: EStructuralFeature): boolean {
        if(!eobj.eType) return false;
        if(!isEAttribute(eobj)) return false;
        return eobj.eType.name == 'EDate';
    }

}
