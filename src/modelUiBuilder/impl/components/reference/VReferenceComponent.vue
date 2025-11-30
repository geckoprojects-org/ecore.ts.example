<script setup lang="ts">
import {computed, ref, watch, inject} from "vue";
import PickList from 'primevue/picklist';
import Button from "primevue/button";

import {useInstanceHolder, useDataInstanceHolder, useMetaModelInstanceHolder} from "@/modelUiBuilder/impl/composeable/InstanceHolder";
import {BasicEList, BasicEObjectList, EClassifier, type EObject, type EReference, isEDataType, EResource} from "@/ecore";
import {useDataTypeHolder} from "@/modelUiBuilder/impl/composeable/DataTypeHolder";
import {useRoute} from "vue-router";
import {useObjectId} from "@/composables/useObjectId";


const route = useRoute();
const props = defineProps<{feature:EReference}>()
const inst = defineModel<EObject>();

// Determine which instance holder to use based on current route
const isInstanceRoute = computed(() => route.path.startsWith('/instance'));
const isModelingRoute = computed(() => route.path.startsWith('/modeling'));

// For modeling route, get resources from inject
const modelingResources = inject<{value: EResource[]}>('modelingResources', {value: []});
const {getObjectId} = useObjectId();

const instancesHolder = computed(() =>
  isInstanceRoute.value ? useDataInstanceHolder() : useMetaModelInstanceHolder()
);
const dataTypeHolder = useDataTypeHolder();
const avialableList = computed(()=>{
  let ret:Array<{id:string,instance:EObject,name:string}> = [];

  if(isModelingRoute.value){
    // For modeling route, find instances from resources
    const targetClassName = props.feature.eReferenceType?.name;
    if(!targetClassName) return ret;

    for(const resource of modelingResources.value){
      for(const content of resource.eAllContents()){
        if(content.eClass().name === targetClassName){
          const id = getObjectId(content);
          if(!Array.from(listofRefs.value.values()).map(e=>e.id).includes(id)){
            let name = '';
            try{
              name = content.eGet(content.eClass().getEStructuralFeatureFromName('name'));
            }catch (e){
              console.log(e);
            }
            ret.push({id:id,instance:content,name:name})
          }
        }
      }
    }
  } else {
    // For instance route, use instance holder
    const intnaces = instancesHolder.value.findInstancesByClass(props.feature.eReferenceType);
    intnaces.forEach((value, key, map)=>{
      if(!Array.from(listofRefs.value.values()).map(e=>e.id).includes(key)){
        let name = '';
        try{
           name = value.eGet(value.eClass().getEStructuralFeatureFromName('name'));
        }catch (e)
        {
          console.log(e);
        }
        ret.push({id:key,instance:value,name:name})
      }
    })
  }

  if(props.feature.eType.name == 'EDataType' || props.feature.eType.name == 'EClassifier'){
    Array.from(dataTypeHolder.datatypes.value.values()).forEach(dt=>{
      ret.push({id:dt.name,instance:dt,name:dt.name})
    })
  }
  return ret;
})
const listofRefs = computed(()=>{
  let map:Array<{id:string,instance:EObject,name:string}> = []

  if(props.feature.upperBound==1){
    const i:EClassifier = inst.value?.eGet(props.feature)
    if(i){
      if(isEDataType(i)){
        map.push({id: i.name??'unknown', instance: i,name:i.name})
      }
      else {
        let name = '';
        try{
          name = i.eGet(i.eClass().getEStructuralFeatureFromName('name'));
        }catch (e){
          console.log(e);
        }
        const id = isModelingRoute.value ? getObjectId(i) : (instancesHolder.value.identify(i)??'unknown');
        map.push({id: id, instance: i,name:name})
      }

    }

  }else{
    const listofInstances:BasicEObjectList<any> = inst.value?.eGet(props.feature)
    if(listofInstances) {
      const arr = listofInstances.toArray();
      map = arr.map((i: any) => {
        if(isEDataType(i)){
          return {id: i.name??'unknown', instance: i,name:i.name}
        }
        else {
          let name = '';
          try{
            name = i.eGet(i.eClass().getEStructuralFeatureFromName('name'));
          }
          catch (e){
            console.log(e);
          }
          const id = isModelingRoute.value ? getObjectId(i) : (instancesHolder.value.identify(i)??'unknown');
          return {id: id, instance: i,name:name}
        }
      })
    }
  }


  return map;
})
const list = ref([avialableList.value,listofRefs.value]);



const set = (val:any)=>{
  const list:BasicEObjectList<EObject> = inst.value!.eGet(props.feature)
  const instances = val[1].map((e:{id:string,instance:EObject})=> e.instance)
  if(props.feature.upperBound==1){
    const ref =  inst.value?.eGet(props.feature);
    inst.value?.eSet(props.feature,instances[0]);
  }else{

    const bel = new BasicEList(instances);
    //console.log(list)
    /*for (let i = 0; i<list.toArray().length;i++){
      list.removeAt(i)
    }*/
   //  list.clear();
    //list.removeAt(0)


    //list.clear()
   // let set = new Set();
   //let arr = val[1].map((e:{id:string,instance:EObject})=>e.instance);

   //console.log(instances)
    //list.insertAll(0,instances);
    /*instances.forEach((e:EObject)=> {
      console.log(e);

      list.add(e);
    });*/
   //   set.add(e);
    //});

    //  list.add(e);
//
 //   })

    //console.log(props.feature);
    //console.log(list.toArray().length);
    inst.value?.eSet(props.feature, bel);

  }
}
const remove = (re)=>{
  //console.log(re.items);
}



</script>

<template>
  <div class="input">

    <label :for="props.feature.name">{{props.feature.name}}({{props.feature.eType.name}})</label>
    <br>
    <Button label="+" />
      <PickList v-model="list" @update:modelValue="set" @move-to-source="remove" dataKey="id" breakpoint="1400px" :showSourceControls="false" :showTargetControls="false">

        <template #option="{ option  }">
          {{ option.name||option.id}}
        </template>

      </PickList>

  </div>
</template>

<style scoped>

</style>
