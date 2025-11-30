
import {computed, ref, toRaw, triggerRef} from "vue";
import type {EClass, EObject, EPackage, EResource, EAdapter, ENotification, EObjectIDManager} from "@/ecore";
import {EcoreUtils, URI, AbstractEAdapter} from "@/ecore";
import {isEPackage} from "@/ecore/EPackageExt";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

// Custom ID Manager for string-based IDs
class StringIDManager implements EObjectIDManager {
    private _objectToID: Map<EObject, string> = new Map();
    private _idToObject: Map<string, EObject> = new Map();
    private _detachedToID: Map<EObject, string> = new Map();

    clear(): void {
        this._objectToID.clear();
        this._idToObject.clear();
        this._detachedToID.clear();
    }

    register(object: EObject): void {
        if (!this._objectToID.has(object)) {
            let id = this._detachedToID.get(object);
            if (!id) {
                id = uid.rnd();
            } else {
                this._detachedToID.delete(object);
            }
            this.setID(object, id);
        }
    }

    unRegister(object: EObject): void {
        const id = this._objectToID.get(object);
        if (id) {
            this._idToObject.delete(id);
            this._objectToID.delete(object);
            this._detachedToID.set(object, id);
        }
    }

    setID(object: EObject, newID: string): void {
        // Remove old mapping if exists
        if (this._objectToID.has(object)) {
            const oldID = this._objectToID.get(object);
            this._idToObject.delete(oldID);
        }

        // Set new mapping
        if (newID) {
            this._objectToID.set(object, newID);
            this._idToObject.set(newID, object);
        } else {
            this._objectToID.delete(object);
        }
    }

    getID(object: EObject): string {
        return this._objectToID.get(object);
    }

    getEObject(id: string): EObject {
        return this._idToObject.get(id);
    }

    getDetachedID(object: EObject): string {
        return this._detachedToID.get(object);
    }
}

// Adapter to listen to resource changes and trigger Vue reactivity
class ResourceChangeAdapter extends AbstractEAdapter {
    constructor(private resourceRef: any) {
        super();
    }

    notifyChanged(notification: ENotification): void {
        // Trigger re-computation when resource contents change
        triggerRef(this.resourceRef);
    }
}

const metaModelResource = ref<EResource | null>(null)
const dataResource = ref<EResource | null>(null)

export function useMetaModelInstanceHolder() {

    const setResource=(resource:EResource)=>{
        // Add adapter to listen for changes
        const adapter = new ResourceChangeAdapter(metaModelResource);
        resource.eAdapters.add(adapter);
        metaModelResource.value = resource;
    }

    // Compute all instances from the resource
    const instances = computed(()=>{
        const allInstances = new Map<string,EObject>();

        if(!metaModelResource.value) return allInstances;

        // Iterate through all contents of the resource
        for(const content of metaModelResource.value.eAllContents()){
            // Try to get unique ID from EMF
            let id = EcoreUtils.getEObjectID(content);

            // If no ID attribute, use object reference as fallback
            if(!id || id === ''){
                // Use a stable ID based on the object itself
                id = identify(content) || uid.rnd();
                try {
                    EcoreUtils.setEObjectID(content, id);
                } catch (e) {
                    // Ignore if object doesn't support ID
                }
            }

            allInstances.set(id, content);
        }

        return allInstances;
    });

    const getInstance=(id:string)=>{
        return instances.value.get(id);
    }

    const setInstance=(id:string,eObj:EObject)=>{
        // Get the existing resource or use the object's resource
        let resource = metaModelResource.value;
        if(!resource){
            resource = eObj.eResource();
            if(resource){
                setResource(resource);
            }
        }

        // Set ID on the object
        try {
            EcoreUtils.setEObjectID(eObj, id);
        } catch (e) {
            // Ignore if object doesn't support ID
        }

        // Add to resource if it's a root object and has no container
        if(resource && !eObj.eContainer()){
            resource.eContents().add(eObj);
        }
    }

    const findInstancesByClass=(eClass:EClass)=>{
        const foundinstances:Map<string,EObject> = new Map();
        for (const instance of instances.value.entries()){

                if (EcoreUtils.equals(instance[1].eClass(), eClass)) {
                    foundinstances.set(instance[0], instance[1]);
                    continue;
                }
                if (eClass.isSuperTypeOf(instance[1].eClass())) {
                    foundinstances.set(instance[0], instance[1]);
                }

        }
        return foundinstances;
    }

    const identify=(eObj:EObject)=>{
        for (const instance of instances.value.entries()){
            if(eObj == instance[1]){
                return instance[0];
            }
        }
    }

    return{
        instances,
        getInstance,
        setInstance,
        setResource,
        findInstancesByClass,
        identify

    }
}

export function useDataInstanceHolder() {

    const setResource=(resource:EResource)=>{
        // Set up ID manager for the resource
        if(!resource.eObjectIDManager){
            resource.eObjectIDManager = new StringIDManager();
        }

        // Add adapter to listen for changes
        const adapter = new ResourceChangeAdapter(dataResource);
        resource.eAdapters.add(adapter);
        dataResource.value = resource;
    }

    // Compute all instances from the resource
    const instances = computed(()=>{
        const allInstances = new Map<string,EObject>();

        if(!dataResource.value) return allInstances;

        const idManager = dataResource.value.eObjectIDManager;
        if(!idManager) return allInstances;

        // Iterate through direct contents of the resource (the actual data instances)
        const contents = dataResource.value.eContents();
        for(let i = 0; i < contents.size(); i++){
            const content = contents.get(i);

            // Get the ID from the ID manager
            let id = idManager.getID(content);

            // Only add to map if it has an ID
            if(id && id !== ''){
                allInstances.set(id, content);
            }
        }

        return allInstances;
    });

    const getInstance=(id:string)=>{
        return instances.value.get(id);
    }

    // Add instance and return its ID
    const addInstance=(eObj:EObject):string=>{
        if(!dataResource.value){
            throw new Error('No data resource available. Resource must be created first in Instance.vue');
        }

        const idManager = dataResource.value.eObjectIDManager;
        if(!idManager){
            throw new Error('No ID manager on resource');
        }

        // Generate ID for this instance
        const id = uid.rnd();

        // Set the ID using the ID manager
        idManager.setID(eObj, id);

        // Add the instance to the resource
        dataResource.value.eContents().add(eObj);

        return id;
    }

    const setInstance=(id:string, eObj:EObject)=>{
        if(!dataResource.value){
            throw new Error('No data resource available');
        }

        // Set ID on the object
        try {
            EcoreUtils.setEObjectID(eObj, id);
        } catch (e) {
            // Ignore if object doesn't support ID
        }

        // Add to resource
        dataResource.value.eContents().add(eObj);
    }

    const findInstancesByClass=(eClass:EClass)=>{
        const foundinstances:Map<string,EObject> = new Map();

        for (const instance of instances.value.entries()){
                const instanceClass = instance[1].eClass();

                // Compare by name and package URI instead of object equality
                const nameMatch = instanceClass?.name === eClass?.name;
                const packageMatch = instanceClass?.ePackage?.nsURI === eClass?.ePackage?.nsURI;

                if (nameMatch && packageMatch) {
                    foundinstances.set(instance[0], instance[1]);
                    continue;
                }
                if (eClass.isSuperTypeOf(instanceClass)) {
                    foundinstances.set(instance[0], instance[1]);
                }
        }
        return foundinstances;
    }
    const identify=(eObj:EObject)=>{
        if(!dataResource.value) return undefined;
        const idManager = dataResource.value.eObjectIDManager;
        if(!idManager) return undefined;

        return idManager.getID(eObj);
    }

    return{
        instances,
        getInstance,
        setInstance,
        addInstance,
        setResource,
        findInstancesByClass,
        identify

    }
}

// Backwards compatibility - defaults to metamodel
export function useInstanceHolder() {
    return useMetaModelInstanceHolder();
}
