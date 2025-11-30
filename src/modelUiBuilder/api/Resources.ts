import type {EClass, EObject, URI} from "@masagroup/ecore/dist/internal";

export interface ResourcesI{
    loadResource(uri:URI):Promise<void>
}
