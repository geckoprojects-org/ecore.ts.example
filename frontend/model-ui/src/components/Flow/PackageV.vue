<script  lang="ts" setup>
import {Handle, Position, useVueFlow} from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import {EClass, EObject, URI, EPackage, BasicEObjectList, EClassImpl, EcorePackageImpl, EcoreFactory} from "@/ecore";
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";
import {MODELING_PARAM} from "@/router";
import {useRouter} from "vue-router";
import {toRaw} from "vue";
import {useObjectId} from "@/composables/useObjectId";



interface NodeData {
  toolbarVisible: boolean
  toolbarPosition: Position
  instance:EObject;
}

interface Props {
  data: NodeData
  label: string
  id:string
}

const props = defineProps<Props>();
const emits =defineEmits(['nodeClick'])
const router = useRouter();
const {getObjectId} = useObjectId();
const {

  onNodeClick,

} = useVueFlow()

const {store} = useResource();
onNodeClick((event) => {
  emits('nodeClick',event)
})

const addEClass = ()=>{
  const efc:EcoreFactory = useResource().ecorePackage.eFactoryInstance;
  const pack = toRaw(props.data.instance);
  const aclass =  efc.createEClassFromContainer(pack)

  // Trigger resource notification manually
  const resource = pack.eResource();
  if(resource){
    resource.eNotify({
      eventType: 1, // ADD
      notifier: resource,
      feature: null,
      oldValue: null,
      newValue: aclass,
      position: -1
    } as any);
  }

  const id = getObjectId(aclass);
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}
const addEAnnotation = ()=>{
  const efc:EcoreFactory = useResource().ecorePackage.eFactoryInstance;
  const pack = toRaw(props.data.instance);
  const aeanno =  efc.createEAnnotationFromContainer(pack)

  // Trigger resource notification manually
  const resource = pack.eResource();
  if(resource){
    resource.eNotify({
      eventType: 1, // ADD
      notifier: resource,
      feature: null,
      oldValue: null,
      newValue: aeanno,
      position: -1
    } as any);
  }

  const id = getObjectId(aeanno);
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}
</script>

<template>
  <div>
  <NodeToolbar :is-visible="data.toolbarVisible" :position="data.toolbarPosition">

    <button @click="addEAnnotation">+ EAnnotation</button>
    <button @click="addEClass">+ EClass</button>
    <button>+ EDataType</button>
    <!--<button>+ EEnum</button>
    <button>+ EPackage</button>-->

  </NodeToolbar>

  <div>
    {{ label }}
    {{props.id}}
  </div>
  </div>


</template>
