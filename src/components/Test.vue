<script setup lang="ts">
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";
import {
  BasicEObjectList,
  EClass,
  EClassifier,
  EcorePackage,
  EObject,
  EResourceSetImpl,
  getEcoreFactory,
  URI
} from "@/ecore";
import {isEClass} from "@/ecore/EClassExt";




const {loadResource,store} = useResource();
await loadResource(new URI('http://localhost:5173/Conference.ecore'));
const data =await fetch('http://localhost:5173/Conference.ecore');
const url = new URI('http://localhost:5173/Conference.ecore');
const urlpart = new URI('http://localhost:5173/Conference.ecore#//Track');

//const xrsf2:EResourceSet = new XMLResourceFactory();
//const xrsf2 = new XMIResourceFactory();


const ecoreFactory = getEcoreFactory();

const rs = new EResourceSetImpl();
const res = rs.createResource(url);
const dataAsText = await data.text();

res.loadFromString(dataAsText)
const package1:EcorePackage= res.eContents().get(0) as EcorePackage;

const contents = package1.eContents().toArray()

let trackClass;
let trackInst1;
let trackInst2;
let trackInst3;
let trackInst4;
let trackInst5;
let confClass;
let confInst1;

for (const eobj of contents) {
  if (isEClass(<EClassifier>eobj)) {

    const eClass = eobj as EClass;
    if (eClass.name === 'Track') {

      trackClass = eClass
      trackInst1 = eClass.ePackage.eFactoryInstance.create(eClass);
      trackInst2 = eClass.ePackage.eFactoryInstance.create(eClass);
      trackInst3 = eClass.ePackage.eFactoryInstance.create(eClass);
      trackInst4 = eClass.ePackage.eFactoryInstance.create(eClass);
      trackInst5 = eClass.ePackage.eFactoryInstance.create(eClass);
    }
    if (eClass.name === 'Conference') {
      const confClass = eClass;
      const confInst1 = eClass.ePackage.eFactoryInstance.create(eClass);
      //console.log(confClass.eAllStructuralFeatures);
      //console.log(confClass.getEStructuralFeature(4));
      const baseList:BasicEObjectList<EObject> =  confInst1.eGet(confClass.getEStructuralFeature(4));
      baseList.clear();
      console.log(baseList.toArray().length)
      baseList.add(trackInst1!);
      baseList.add(trackInst2!);
      baseList.add(trackInst3!);
      baseList.add(trackInst4!);
      baseList.add(trackInst5!);
      confInst1.eSet(confClass.getEStructuralFeature(4),baseList);
      const baseListRelaod:BasicEObjectList<EObject> =  confInst1.eGet(confClass.getEStructuralFeature(4));

      console.log(baseListRelaod.toArray().length)
    }
  }
}
</script>

<template>

</template>

<style scoped>

</style>
