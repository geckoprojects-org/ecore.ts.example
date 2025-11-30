import type {EObject, EStructuralFeature} from "@masagroup/ecore/dist/internal";
import type {Component} from "vue";

export interface ComponentDescribtorI{
    component: Component
    can_handle_EObjet(eobj:EStructuralFeature):boolean
}
