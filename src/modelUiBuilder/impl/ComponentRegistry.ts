import type {ComponentRegistryI} from "@/modelUiBuilder/api/ComponentRegistry";

import type {Component} from "vue";
import type {ComponentDescribtorI} from "@/modelUiBuilder/api/ComponentDescribtor";
import {EStructuralFeature} from "@/ecore";

export class ComponentRegistry implements ComponentRegistryI{

    static registry:Array<ComponentDescribtorI> = [];
    getComponent(e: EStructuralFeature): Component|undefined{
        for (const key in ComponentRegistry.registry){
            if(ComponentRegistry.registry[key].can_handle_EObjet(e)){
                return ComponentRegistry.registry[key].component;
            }
        }
        return undefined;
    }

    register(componentDescriptor: ComponentDescribtorI): void {
        ComponentRegistry.registry.push(componentDescriptor);
    }

    unregister(componentDescriptor: ComponentDescribtorI): void {
        for (const key in ComponentRegistry.registry){
            if(componentDescriptor === ComponentRegistry.registry[key]){
                delete ComponentRegistry.registry[key];
            }
        }
    }

}
