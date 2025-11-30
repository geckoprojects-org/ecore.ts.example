import {ComponentRegistry} from "@/modelUiBuilder/impl/ComponentRegistry";
import {StringComponent} from "@/modelUiBuilder/impl/components/string/StringComponent";
import {DateTimeComponent} from "@/modelUiBuilder/impl/components/datetime/DateTimeComponent";

import {ref} from "vue";
import Resources from "@/modelUiBuilder/impl/Resources";
import {EcoreFactory, EcorePackageImpl, EResource, EResourceSetImpl, URI} from "@/ecore";

const store = ref<Resources[]> ([])
const rs = new EResourceSetImpl();
const ecorePackage = EcorePackageImpl.getInstance();
const efc:EcoreFactory = ecorePackage.eFactoryInstance;
export function useResource() {

    const loadResource = async (url:URI,path:string)=>{

             const res = new Resources(rs)
             await res.loadResource(url,path);
             store.value.push(res)
    }
    const getResource=(resUri:string):EResource|undefined =>{
        return (store.value.find(e=>e.res?.eURI.toString() == resUri))?.res
    }
    const getResourceSet=():EResourceSetImpl|undefined =>{
        return rs;
    }
    return { loadResource,store,getResource,getResourceSet,ecorePackage,efc}
}
