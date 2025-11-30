
import {ref} from "vue";
import type { EDataType, EObject} from "@/ecore";


const datatypes = ref<Map<string,EDataType>>(new Map())

export function useDataTypeHolder() {

    const getDataTypes=(name:string)=>{
        return datatypes.value.get(name);
    }
    const setDataTypes=(name:string,eObj:EDataType)=>{


        return datatypes.value.set(name,eObj);

    }


    return{
        getDataTypes,
        setDataTypes,
        datatypes,
    }
}
