import { describe, it, expect } from 'vitest'

import {useResource} from "../../modelUiBuilder/impl/composeable/Resource";
import {
  BasicEObjectList,
  EObject,
  EResourceSetImpl,
  getEcoreFactory,
  isEClass,
  URI
} from "@masagroup/ecore/dist/internal";
import type { EClass,EClassifier} from "@masagroup/ecore/dist/internal";
import type {EcorePackage} from "@masagroup/ecore/dist/EcorePackage";
import {useInstanceHolder} from "../../modelUiBuilder/impl/composeable/InstanceHolder";


describe('HelloWorld', () => {
  it('renders properly', async () => {
    const instancesHolder = useInstanceHolder();
    console.log('sfa'
    )
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
          instancesHolder.setInstance('1',trackInst1);
          instancesHolder.setInstance('2',trackInst2);
          instancesHolder.setInstance('3',trackInst3);
          instancesHolder.setInstance('4',trackInst4);
          instancesHolder.setInstance('5',trackInst5);
        }
        if (eClass.name === 'Conference') {
          const confClass = eClass;
          const confInst1 = eClass.ePackage.eFactoryInstance.create(eClass);
          //console.log(confClass.eAllStructuralFeatures);
          //console.log(confClass.getEStructuralFeature(4));
          const baseList:BasicEObjectList<EObject> =  confInst1.eGet(confClass.getEStructuralFeature(4));
          console.log(baseList.toArray().length)
          baseList.clear();
          console.log(baseList.toArray().length)
          baseList.add(instancesHolder.getInstance('1')!);
          baseList.add(instancesHolder.getInstance('2')!);
          baseList.add(instancesHolder.getInstance('3')!);
          baseList.add(instancesHolder.getInstance('4')!);
          baseList.add(instancesHolder.getInstance('5')!);
          console.log(baseList.toArray().length)

          confInst1.eSet(confClass.getEStructuralFeature(4),baseList);

          const baseListRelaod:BasicEObjectList<EObject> =  confInst1.eGet(confClass.getEStructuralFeature(4));
          baseListRelaod.removeAt(0);
          baseListRelaod.removeAt(0);
          baseListRelaod.removeAt(0);
          baseListRelaod.removeAt(0);
          baseListRelaod.removeAt(0);


          //baseListRelaod.clear();

          console.log(baseListRelaod.toArray().length)
          baseListRelaod.add(instancesHolder.getInstance('1')!);
          baseListRelaod.add(instancesHolder.getInstance('2')!);
          baseListRelaod.add(instancesHolder.getInstance('3')!);
          baseListRelaod.add(instancesHolder.getInstance('4')!);
          baseListRelaod.add(instancesHolder.getInstance('5')!);

          console.log(baseListRelaod.toArray().length)
        }
      }
    }

    expect(1+2).toBe(3)
  })
})
