<script setup lang="ts">
import {onMounted, ref} from "vue";
  import {useRouter} from "vue-router";
  import ComposerVue from "@/modelUiBuilder/impl/components/composer/ComposerVue.vue";
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";
import {useInstanceHolder} from "@/modelUiBuilder/impl/composeable/InstanceHolder";
import {INSTANCE_PAGE} from "@/router";
import ShortUniqueId from "short-unique-id";
import {EClass, EClassifier, EObject, URI} from "@/ecore";




const router = useRouter();
const {store} = useResource()
const instance = ref<EObject|undefined>(undefined);
const uid = new ShortUniqueId({ length: 10 });
const uri2 = new URI('Ecore2.ecore');

  onMounted(()=>{
    const {resUri,className,ePackage} = (router.currentRoute.value.params);
    console.log(store.value);
    console.log(resUri);
    console.log(ePackage);
    console.log(className);

    const res = (store.value.find(e=>e.res?.eURI.toString() == resUri))?.res


    let uris = new URI(resUri+'#//'+className);
    const eClass = res?.eResourceSet().getEObject(uris,false) as EClass;
    let rs2 = res?.eResourceSet().createResource(uri2);
    console.log(rs2?.eURI.isOpaque());
    //eClass.




    const instanceInternal =eClass?.ePackage.eFactoryInstance.create(eClass);
    rs2?.eContents().add(instanceInternal);
    console.log(rs2?.saveToString());

   //eClass.ePackage.eFactoryInstance.createFromString(eClass.instanceTypeName.)

    const id =uid.rnd();
    useInstanceHolder().setInstance(id,instanceInternal);
    instance.value = instanceInternal;
    router.push({name:INSTANCE_PAGE,params:{instanceid:id}})
  });


</script>

<template>


</template>

<style scoped>

</style>
