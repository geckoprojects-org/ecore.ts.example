import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";
import type {Component} from "vue";

import VReferenceComponent from "@/modelUiBuilder/impl/components/reference/VReferenceComponent.vue";
import type {EStructuralFeature} from "@/ecore";
import {isEReference} from "@/ecore";


export class ReferenceComponent implements ComponentDescribtorI{
    component:Component =  VReferenceComponent;

    can_handle_EObjet(eobj: EStructuralFeature): boolean {
        return isEReference(eobj);
    }

}
