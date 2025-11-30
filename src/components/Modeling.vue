<script setup lang="ts">


import {type Component, computed, nextTick, onMounted, ref, toRaw, watch, triggerRef, provide} from "vue";
//@ts-ignore


import ComposerVue from "@/modelUiBuilder/impl/components/composer/ComposerVue.vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";
import {
  EClass,
  EClassifier, EDataType,
  EList,
  EObject,
  EcoreUtils,
  EPackage,
  EPackageExt,
  EReference, EResourceSetImpl,
  isEClass,
  isEDataType, isEPackage,
  URI, EResourceImpl, EcoreFactoryImpl, EcorePackageImpl, EcoreConstants, BasicEObjectList, EAttribute, EcoreFactory, EResource
} from "@/ecore";

import {Dimensions, MarkerType, NodeDragEvent, Position, useVueFlow, VueFlow, XYPosition} from '@vue-flow/core'
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import PackageV from "@/components/Flow/PackageV.vue";
import ScrollPanel from 'primevue/scrollpanel';
import ClassV from "@/components/Flow/ClassV.vue";
import {useRouter} from "vue-router";
import type {Node} from '@vue-flow/core';
import {MODELING_PARAM} from "@/router";
import MenubarV from "@/components/MenubarV.vue";
import Tree from "@/components/Tree.vue";
import {useDataTypeHolder} from "@/modelUiBuilder/impl/composeable/DataTypeHolder";
import config from "@/config/config";
import {DefaultApi} from "../../openapi/client";
import Resources from "@/modelUiBuilder/impl/Resources";
import ShortUniqueId from "short-unique-id";
import {useLayout} from "@/composables/layout";
import {useColaLayout} from "@/composables/colaLayout";
import {AbstractEAdapter} from "@/ecore";
import type {ENotification, EAdapter} from "@/ecore";
import {useObjectId} from "@/composables/useObjectId";

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

const model = ref<EObject|undefined>(undefined);
const resources = ref<EResource[]>([]);
const router = useRouter();

const {getObjectId, getObjectById} = useObjectId();

// Provide resources to child components (Tree.vue)
provide('modelingResources', resources);

const {onConnect,addEdges,onNodeDragStop,getNodes,fitView,setNodes,setCenter,getNode} = useVueFlow()
const PositionHolder = ref<Map<String,XYPosition>>(new Map<String,XYPosition>());
const DimensionsHolder = ref<Map<String,any>>(new Map<String,any>());



onMounted(async ()=> {

  const {loadResource,store,getResource,ecorePackage,getResourceSet,efc} = useResource()
  const {setDataTypes} = useDataTypeHolder()

  const data = await fetch('Conference.ecore');
  const dataAsText = await data.text();
  console.log(dataAsText)


  const eoi = ecorePackage;
  const reSet = getResourceSet()
  reSet?.getPackageRegistry().registerPackage(eoi);


  const resImport = reSet?.createResource(new URI('conference.ecore'));

  resImport?.loadFromString(dataAsText)



  // Add resources and set up adapters
  const resourceArray: EResource[] = [];
  if(resImport){
    const adapter = new ResourceChangeAdapter(resources);
    resImport.eAdapters.add(adapter);
    resourceArray.push(resImport);
  }
  resources.value = resourceArray;

});

watch(router.currentRoute,()=>{
  const {instanceid} = (router.currentRoute.value.params);
  model.value = getObjectById(instanceid as string);

  // Center the view on the selected node
  if(instanceid){
    nextTick(() => {
      const node = getNodes.value.find(n => n.id === instanceid);
      if(node){
        // Get the parent node position if this is a child node
        let absoluteX = node.position.x;
        let absoluteY = node.position.y;

        if(node.parentNode){
          const parentNode = getNodes.value.find(n => n.id === node.parentNode);
          if(parentNode){
            absoluteX += parentNode.position.x;
            absoluteY += parentNode.position.y;
          }
        }

        const width = node.width || 450;
        const height = node.height || 350;

        setCenter(absoluteX + width / 2,
                  absoluteY + height / 2,
                  { zoom: 1, duration: 500 });
      }
    });
  }
})


const { graph, layout, previousDirection } = useColaLayout()
const nodes = computed({
get:() =>{
  let ret:any = [];

  // First pass: collect packages and their classes
  const packageMap = new Map<string, {packageNode: any, classes: Map<string, any>}>();
  const packages: any[] = [];

  // Iterate over all resources and their contents
  for(const resource of resources.value){
    for(const content of resource.eAllContents()){
      if('EPackage' == content.eClass().name){
        const id = getObjectId(content);
        const name = content.eGet(content.eClass().getEStructuralFeatureFromName('name'));
        const nsURI = content.eGet(content.eClass().getEStructuralFeatureFromName('nsURI'));

        packages.push({
          id: id,
          name: name,
          instance: content,
          nsURI: nsURI
        });
        packageMap.set(id, {packageNode: null, classes: new Map()});
      }
    }
  }

  // Collect classes
  for(const resource of resources.value){
    for(const content of resource.eAllContents()){
      if('EClass' == content.eClass().name){
        const id = getObjectId(content);
        const ePaclageId = content.eClass().getEStructuralFeatureFromName('ePackage');
        const packageObj = content.eGet(ePaclageId);
        const parent = packageObj ? getObjectId(packageObj) : undefined;

        const classInfo = {
          id: id,
          instance: content,
          parent: parent
        };

        if(parent && packageMap.has(parent)){
          packageMap.get(parent)!.classes.set(id, classInfo);
        }
      }
    }
  }

  // Layout configuration
  const PACKAGE_SPACING_X = 1200;
  const CLASS_SPACING_X = 500;
  const CLASS_SPACING_Y = 80;
  const CLASS_HEIGHT = 350;
  const CLASS_START_Y = 40;
  const CLASS_START_X = 40;
  const PACKAGE_START_Y = 50;
  const PACKAGE_PADDING = 60;

  // Second pass: position packages and classes
  let cumulativePackageX = 50;

  packages.forEach((pkg, pkgIndex) => {
    const pkgClasses = packageMap.get(pkg.id)?.classes;
    if(!pkgClasses || pkgClasses.size === 0) return;

    const allClassIds = Array.from(pkgClasses.keys());
    const maxClassesPerRow = 3;
    const classPositions = new Map<string, {x: number, y: number, width: number, height: number}>();

    let currentX = CLASS_START_X;
    let currentY = CLASS_START_Y;
    let maxHeightInRow = 0;
    let columnInRow = 0;
    let maxWidth = 0;
    let totalHeight = CLASS_START_Y;

    allClassIds.forEach((classId, classIndex) => {
      const classDim = DimensionsHolder.value.get(classId);
      let width = 450;
      let height = CLASS_HEIGHT;

      if (classDim) {
        const widthStr = typeof classDim.width === 'string' ? classDim.width.replace('px', '') : classDim.width;
        const heightStr = typeof classDim.height === 'string' ? classDim.height.replace('px', '') : classDim.height;

        const parsedWidth = parseFloat(widthStr);
        const parsedHeight = parseFloat(heightStr);

        if (!isNaN(parsedWidth) && parsedWidth > 0) {
          width = parsedWidth;
        }
        if (!isNaN(parsedHeight) && parsedHeight > 0) {
          height = parsedHeight;
        }
      }

      if (columnInRow >= maxClassesPerRow) {
        currentX = CLASS_START_X;
        currentY += maxHeightInRow + CLASS_SPACING_Y;
        totalHeight = currentY;
        maxHeightInRow = 0;
        columnInRow = 0;
      }

      classPositions.set(classId, {
        x: currentX,
        y: currentY,
        width: width,
        height: height
      });

      maxHeightInRow = Math.max(maxHeightInRow, height);
      maxWidth = Math.max(maxWidth, currentX + width);

      currentX += width + CLASS_SPACING_X;
      columnInRow++;
    });

    totalHeight = currentY + maxHeightInRow;

    const packageWidth = maxWidth + CLASS_START_X;
    const packageHeight = totalHeight + CLASS_START_Y;

    const pos = PositionHolder.value.get(pkg.id) || {
      x: cumulativePackageX,
      y: PACKAGE_START_Y
    };

    ret.push({
      id: pkg.id,
      label: 'EPackage: ' + pkg.name + ' (' + pkg.nsURI + ')',
      data: { toolbarPosition: Position.Top, instance: pkg.instance},
      position: toRaw(pos),
      type: 'package',
      style: {
        backgroundColor: 'rgba(226,231,229,0.5)',
        width: packageWidth + 'px',
        height: packageHeight + 'px'
      },
    });

    cumulativePackageX += packageWidth + PACKAGE_PADDING;

    // Position classes
    pkgClasses.forEach((classInfo, classId) => {
      const position = classPositions.get(classId);
      if(!position) return;

      const classPos = PositionHolder.value.get(classId) || {
        x: position.x,
        y: position.y
      };
      ret.push({
        id: classId,
        label: 'EClass',
        data: { toolbarPosition: Position.Top, instance: classInfo.instance},
        position: toRaw(classPos),
        type: 'class',
        parentNode: pkg.id,
        expandParent: true
      });
    });
  });

  return ret;
},
set:(val:Array<Node<any>>)=>{
}
});

onNodeDragStop((param:NodeDragEvent)=>{
  console.log(param.node)
  getNodes.value.map(e=>{
    PositionHolder.value.set(e.id ,e.position as XYPosition);
    DimensionsHolder.value.set(e.id,{height:e.dimensions.height+'px',width:e.dimensions.width+'px'});
  })
})

const edges = computed(()=>{
  let iedges:any = []

  // Iterate over all resources and their contents
  for(const resource of resources.value){
    for(const content of resource.eAllContents()){
      if('EClass' == content.eClass().name){
        const key = getObjectId(content);

        const superTypeClassFeature = content.eClass().getEStructuralFeatureFromName('eSuperTypes');
        const list = content.eGet(superTypeClassFeature) as EList<EClass>;
        for (const entry of list){
          const id = getObjectId(entry);
          iedges.push({id:`${key}_${id}`,
            source:key,
            sourceHandle:key,
            target:id,
            markerEnd:MarkerType.ArrowClosed,
            type:'step'})
        }

        const referenceClassFeature = content.eClass().getEStructuralFeatureFromName('eReferences');
        const list2 = content.eGet(referenceClassFeature) as EList<EReference>;
        for (const entry of list2){
          try{
            const eReferenceType = entry.eGet(entry.eClass().getEStructuralFeatureFromName('eReferenceType'));
            const name = entry.eGet(entry.eClass().getEStructuralFeatureFromName('name'));
            let upperBound = -1;
            let lowerBound= 0;

            lowerBound = entry.eGet(entry.eClass().getEStructuralFeatureFromName('lowerBound'));
            upperBound = entry.eGet(entry.eClass().getEStructuralFeatureFromName('upperBound'));

            const id = getObjectId(eReferenceType);
            let obj:any =
                {id:`${key}_${id}_${name}`
                  ,source: key,
                  target:id,
                  sourceHandle:name,
                  targetHandle:'target' ,
                  type:'step',
                  label:`[${lowerBound}:${upperBound}]` ,
                  style: { stroke: 'orange','stroke-dasharray':"5,10,5" }};
            iedges.push(obj)
          }catch (e){
            console.log(e);
          }
        }
      }
    }
  }

  return iedges
})

const selectInstrance = (ev:any)=>{
  router.push({name:MODELING_PARAM,params:{instanceid:ev.node.id}});
}

onConnect((params)=>{
  const source = getObjectById(params.source);
  const target = getObjectById(params.target);

  const superTypeFeature = source?.eClass().getEStructuralFeatureFromName('eSuperTypes');
  if(superTypeFeature){
    const list = source?.eGet(superTypeFeature!) as EList<any>;
    list.add(target);
    source?.eSet(superTypeFeature,list)
  }
})

async function layoutGraph(direction:string) {
 const slayout = layout(nodes.value, edges.value, direction) as Node[];
  const map = new Map<String,XYPosition>();
  const map2 = new Map<String,any>();

  slayout.map(e=>{
    map.set(e.id,e.position);
    map2.set(e.id,{height:e.dimensions.height+'px',width:e.dimensions.width+'px'});
  })

  PositionHolder.value = map;
  DimensionsHolder.value = map2;

  setNodes(slayout)
  nextTick(() => {
    fitView()
  })
}

</script>
<template>
  <div class="modeling-wrapper">
    <Tree class="appmenu"></Tree>
    <div class="iflexed">

    <MenubarV @import="()=>layoutGraph('TB')"></MenubarV>



  <Splitter style="height: 100%" layout="vertical" class="margin">
    <SplitterPanel class="flex items-center justify-center">
      <VueFlow v-model:nodes="nodes"  :edges="edges"  elevate-edges-on-select >

          <template #node-package="props">
            <PackageV :id="props.id" :data="props.data" :label="props.label"  @nodeClick="selectInstrance" />
          </template>
        <template #node-class="props">
          <ClassV :id="props.id" :data="props.data" :label="props.label"  @nodeClick="selectInstrance" class="vClass"/>
        </template>

        <MiniMap />

        <Controls />

        <Background />
      </VueFlow>
    </SplitterPanel>
    <SplitterPanel class="flex items-center justify-center relative">
      <ScrollPanel  class="full_abs">
        <ComposerVue v-model="model" v-if="model">

        </ComposerVue>
      </ScrollPanel>
    </SplitterPanel>
  </Splitter>

  </div>
  </div>
</template>
<style lang="scss">
.modeling-wrapper {
  display: grid;
  grid-template-columns: 350px 1fr;
}
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.39.0/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.39.0/dist/theme-default.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/minimap@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css';
@import '@/scss/theme-blue.scss';
.vue-flow__node-toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background-color: #2d3748;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.vue-flow__node-toolbar button {
  background: #4a5568;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.vue-flow__node-toolbar button.selected {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.vue-flow__node-toolbar button:hover {

  background-color: hsla(160, 100%, 37%, 0.5);
}

.vue-flow__node-menu {
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.vue-flow__node-menu.selected {
  box-shadow: 0 0 0 2px hsla(160, 100%, 37%, 0.2)
}
.full_abs{
  position:absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
}
.relative{
  position:relative;
}
.vClass{
  height:auto;
  border-radius: 6px;
  padding: 5px;
}
.active {
  border: 1px dashed $base-color;
  border-radius: 7px;
}
.iflexed{
  display: grid;
  grid-template-rows: 110px 1fr;
  /* height: 100%; */
  position: absolute;
  right: 0;
  left: 340px;
  top: 0;
  bottom: 0;

}
</style>
