<script  lang="ts" setup>
import {Handle, Position, useVueFlow} from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import Divider from 'primevue/divider';
import Card from 'primevue/card';
import {computed, toRaw} from "vue";
import {BasicEList, EAttribute, EClass, EcoreFactory, EDataType, EObject, EOperation, EReference, URI} from "@/ecore";
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";
import {useRoute, useRouter} from "vue-router";
import {MODELING_PARAM} from "@/router";
import {useObjectId} from "@/composables/useObjectId";

interface NodeData {
  toolbarVisible: boolean
  toolbarPosition: Position
  instance:EObject,

}

interface Props {
  data: NodeData
  label: string
  id:string
}

const props = defineProps<Props>();
const emits =defineEmits(['nodeClick'])
const {getObjectId} = useObjectId();
const router = useRouter();
const route = useRoute();
const {

  onNodeClick,

} = useVueFlow()
onNodeClick((event) => {
  emits('nodeClick',event)
})


const name = computed(()=>{

  return props.data.instance.eGet(props.data.instance.eClass().getEStructuralFeatureFromName('name'));
});

const attributes = computed(()=>{
  let attrbutesSimple  = [];
  let attr = props.data.instance.eGet(props.data.instance.eClass().getEStructuralFeatureFromName('eAttributes')) as BasicEList<EAttribute>;
  for (const attrb of attr){

    let type = '';
    const etype = attrb.eGet(attrb.eClass().getEStructuralFeatureFromName('eAttributeType'));
    if(etype){
      type =  etype.eGet(etype.eClass().getEStructuralFeatureFromName('name'));
    }

    attrbutesSimple.push( {
      name:attrb.eGet(attrb.eClass().getEStructuralFeatureFromName('name')),
      type:type,
      id:getObjectId(attrb)
    });
  }
  return attrbutesSimple
});

const operations = computed(()=>{
  let operations  = [];
  let ops = props.data.instance.eGet(props.data.instance.eClass().getEStructuralFeatureFromName('eOperations')) as BasicEList<EOperation>;
  for (const op of ops){

    let type = '';
    const etype = op.eGet(op.eClass().getEStructuralFeatureFromName('eType'));
    if(etype){
      type =  etype.eGet(etype.eClass().getEStructuralFeatureFromName('name'));
    }
    operations.push( {
      name:op.eGet(op.eClass().getEStructuralFeatureFromName('name')),
      id:getObjectId(op),
      type:type
    });
  }
  return operations
});
const references = computed(()=>{
  let references  = [];
  let refs = props.data.instance.eGet(props.data.instance.eClass().getEStructuralFeatureFromName('eReferences')) as BasicEList<EReference>;
  for (const refb of refs){

    let type = '';
    const etype = refb.eGet(refb.eClass().getEStructuralFeatureFromName('eType'));
    if(etype){
      type =  etype.eGet(etype.eClass().getEStructuralFeatureFromName('name'));
    }
    let name = '';
    let referencedClassId = '';
    try{
    const eReferenceType = refb.eGet(refb.eClass().getEStructuralFeatureFromName('eReferenceType'));
    if(eReferenceType){
      name = eReferenceType.eGet(eReferenceType.eClass().getEStructuralFeatureFromName('name'));
      referencedClassId = getObjectId(eReferenceType);
    }
    }catch(e){
      console.log(e);
    }

    references.push( {
      name:refb.eGet(refb.eClass().getEStructuralFeatureFromName('name')),
      aclass:name,
      type:type,
      id:getObjectId(refb),
      referencedClassId:referencedClassId
    });
  }
  return references
});

const addAttribute = ()=>{
  const efc:EcoreFactory = useResource().ecorePackage.eFactoryInstance;
  const eclass = toRaw(props.data.instance);
  const eAttribute =  efc.createEAttributeFromContainer(eclass)

  // Trigger resource notification manually
  const resource = eclass.eResource();
  if(resource){
    resource.eNotify({
      eventType: 1, // ADD
      notifier: resource,
      feature: null,
      oldValue: null,
      newValue: eAttribute,
      position: -1
    } as any);
  }

  const id = getObjectId(eAttribute);
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}
const addOperation = ()=>{
  const efc:EcoreFactory = useResource().ecorePackage.eFactoryInstance;
  const eclass = toRaw(props.data.instance);
  const eOperation =  efc.createEOperationFromContainer(eclass)
  const id = getObjectId(eOperation);
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}
const addReference = ()=>{
  const efc:EcoreFactory = useResource().ecorePackage.eFactoryInstance;
  const eclass = toRaw(props.data.instance);
  const eRef =  efc.createEReferenceFromContainer(eclass)
  const id = getObjectId(eRef);
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}

const addEAnnotation = ()=>{
  const efc:EcoreFactory = useResource().ecorePackage.eFactoryInstance;
  const eclass = toRaw(props.data.instance);
  const eAnno =  efc.createEAnnotationFromContainer(eclass)
  const id = getObjectId(eAnno);
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}
const setInstanceRouter=(id:string)=>{
  router.push({name:MODELING_PARAM,params:{instanceid:id}})
}

</script>

<template>
  <div>
  <NodeToolbar :is-visible="data.toolbarVisible" :position="data.toolbarPosition">

    <button class="prim" @click="addEAnnotation">+ EAnnotation</button>
    <button class="prim" @click="addOperation"> + EOperation</button>
    <button class="prim" @click="addAttribute">+ EAttribute</button>
    <button class="prim"  @click="addReference">+ EReference</button>

  </NodeToolbar>


  <Card style="overflow: hidden">
    <template #header>
      <div class="gradient">
        <h2>{{ name }} </h2>
        <h4>EClass</h4>
        {{props.id}}

      </div>


    </template>

    <template #content>


      <div class="attribute" v-for="attribute in attributes"
           :key="attribute.name"
           @click="(e)=>{e.stopImmediatePropagation();setInstanceRouter(attribute.id??'')}"
          :class="{active:attribute.id == route.params?.instanceid??''}"
      >
       {{attribute.name}} :  {{attribute.type}}
      </div>

  <Divider />
      <div class="refrences" v-for="refrence in references" :key="refrence.name"
           @click="(e)=>{e.stopImmediatePropagation();setInstanceRouter(refrence.id??'')}"
           :class="{active:refrence.id == route.params?.instanceid??''}">
        {{refrence.name}} :  <span class="reference-class" @click.stop="(e)=>{if(refrence.referencedClassId) setInstanceRouter(refrence.referencedClassId)}">{{refrence.aclass}}</span>
        <Handle :id="refrence.name" type="source" :position="Position.Right" style="{position:absolute;right: -18px;}" />
      </div>


      <Divider />
      <div class="operation" v-for="operation in operations" :key="operation.name"
           @click="(e)=>{e.stopImmediatePropagation();setInstanceRouter(operation.id??'')}"
           :class="{active:operation.id == route.params?.instanceid??''}">
        {{operation.name}}() : {{operation.type}}

      </div>

    </template>
  </Card>


  <Handle type="target" :position="Position.Bottom" />
  <Handle type="source" :id="props.id" :position="Position.Top" />

  </div>
</template>
<style lang="scss">
@import '@/scss/theme-blue.scss';
.gradient{
  width:100%;
  height:70px;
  background: linear-gradient(83deg, $base-color 0%, $sec-color 100%);
  padding: 7px;
  color: #fff;

}
.refrences{
  position:relative;
}
.reference-class{
  cursor: pointer;
  text-decoration: underline;
  &:hover{
    color: $sec-color;
  }
}
.vue-flow__node-toolbar button:hover {
  background-color: $sec-color;
}

</style>

