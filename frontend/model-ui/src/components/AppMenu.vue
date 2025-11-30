<script setup lang="ts">
import {computed, ref} from "vue";
import Menu from "primevue/menu";
import Avatar from "primevue/avatar";
import Badge from "primevue/badge";
import Button from "primevue/button";
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";

import router, {INSTANCE_PAGE, MODELING_PARAM, NEW_INSTANCE_PAGE} from "@/router";
import {useMetaModelInstanceHolder, useDataInstanceHolder} from "@/modelUiBuilder/impl/composeable/InstanceHolder";
import {isEPackage} from "@/ecore/EPackageExt";
import {EClass, EClassifier, EDataType, EPackage, EResource, isEDataType, URI} from "@/ecore";
import {isEClass} from "@/ecore/EClassExt";
import ShortUniqueId from "short-unique-id";
import {useDataTypeHolder} from "@/modelUiBuilder/impl/composeable/DataTypeHolder";
import {useRoute} from "vue-router";


const route = useRoute();
const uid = new ShortUniqueId({ length: 10 });

const items = ref([
  {
    separator: true
  },

  {
    label: 'no items',
    items: []
  }

]);
const {store} = useResource()

// Determine which instance holder to use based on current route
const isInstanceRoute = computed(() => route.path.startsWith('/instance'));
const instances = computed(() => {
  const holder = isInstanceRoute.value ? useDataInstanceHolder() : useMetaModelInstanceHolder();
  return holder.instances.value;
});

const {setDataTypes} = useDataTypeHolder();
const items2 = computed(()=>  {
  let packages:any = [{
    separator: true
  }];

  if(store.value.length>0){
    const  res:EResource = store.value[0].res!;
    res.eContents().toArray().forEach((eObj:any)=>{
      if(isEPackage(eObj)){

        const ep = (eObj as EPackage);
       // console.log(ep)
        let classes:any[]=[];
        //console.log(ep.eClassifiers.toArray());
        for (const obj of ep.eAllContents()) {
          if (isEClass(<EClassifier>obj)) {
            const classifier = obj as EClassifier;
            classes.push(
                {
                  label: (obj as EClass).name.toString(),
                  icon: 'pi pi-sparkles',
                  eClass: classifier.name,
                  ePackage:classifier.ePackage.nsURI,
                  res:res.eURI

                })
          }
          if (isEDataType(<EClassifier>obj)){
            const dt = obj as EDataType;
              setDataTypes(dt.name,dt);
          }

        }
        if(classes.length>0){
          packages.push({
            label:`${ep.name}  (${ep.nsURI})`,
            icon:'pi pi-box',
            items:classes
          })
        }

      }

    })
  }
  return packages
})
const instancesRep = computed(()=>{

    return Array.from(instances.value.entries()).map((val)=>{return {icon:'pi pi-box',label:val[0]+' ('+val[1].eClass().name+')',id:val[0]}})

})
const toInstPage = (d:any)=>{
  const resUri = d.res;
  const ePackage = d.ePackage;
  const className = d.eClass;

  const res = (store.value.find(e=>e.res?.eURI.toString() == resUri))?.res

  let uris = new URI(resUri+'#//'+className);
  const eClass = res?.eResourceSet().getEObject(uris,false) as EClass;

  // Check if class is abstract
  if(eClass?.abstract){
    console.warn(`Cannot create instance of abstract class: ${className}`);
    return;
  }

  // Create instance from the EClass using the factory
  const instanceInternal = eClass?.ePackage.eFactoryInstance.create(eClass);

  if(isInstanceRoute.value){
    // For data instances, add to the data package and get its ID
    const dataHolder = useDataInstanceHolder();

    // Ensure data resource exists before adding instance
    const resourceSet = res?.eResourceSet();
    const existingResource = resourceSet?.getResource(new URI('data://instances'), false);

    if(!existingResource && resourceSet){
      const dataResource = resourceSet.createResource(new URI('data://instances'));
      dataHolder.setResource(dataResource);
    }

    const instanceId = dataHolder.addInstance(instanceInternal);

    // Navigate to the newly created instance
    router.push({
      name: INSTANCE_PAGE,
      params: { instanceid: instanceId }
    });
  } else {
    // For metamodel instances
    const id = uid.rnd();
    useMetaModelInstanceHolder().setInstance(id, instanceInternal);

    router.push({
      name: MODELING_PARAM,
      params: { instanceid: id }
    });
  }
}
const goInstance = (e:any)=>{
  if(isInstanceRoute.value){
    router.push({
      name:INSTANCE_PAGE,
      params:{instanceid:e.id}
    })
  } else {
    router.push({
      name:MODELING_PARAM,
      params:{instanceid:e.id}
    })
  }
}
</script>

<template>
  <div class="sidebar margin">
  <Menu :model="items2" class="md:w-60 " >
    <template #start>
        <span class="inline-flex items-center gap-1 px-2 py-2">

            <span class="text-xl font-semibold"> Classes</span>
        </span>
    </template>
    <template #submenulabel="{ item }">
      <span class="text-primary font-bold">{{ item.label }}</span>
    </template>
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action" @click="toInstPage(item)" >
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <span class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">+</span>
      </a>
    </template>


  </Menu>
    <div style="height:25px"></div>
    <Menu :model="instancesRep" class="md:w-60 ">
      <template #start>
        <span class="inline-flex items-center gap-1 px-2 py-2">

            <span class="text-xl font-semibold"> Instances</span>
        </span>
      </template>
      <template #submenulabel="{ item }">
        <span class="text-primary font-bold">{{ item }}</span>
      </template>
      <template #item="{ item, props }">
        <a v-ripple class="flex items-center" v-bind="props.action" @click="goInstance(item)">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </template>

    </Menu>
  </div>
</template>

<style>
 .margin{

     margin: 15px;

 }
 .font-semibold{
   margin: 15px;
   font-weight: bold;
 }
</style>
