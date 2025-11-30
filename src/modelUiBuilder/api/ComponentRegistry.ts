import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";
import type {EObject, EStructuralFeature} from "@masagroup/ecore/dist/internal";
import type {Component} from "vue";

export interface ComponentRegistryI{
    register(componentDescriptor:ComponentDescribtorI):void;
    unregister(componentDescriptor:ComponentDescribtorI):void
    getComponent(e:EStructuralFeature):Component|undefined
}
