<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
  import ComposerVue from "@/modelUiBuilder/impl/components/composer/ComposerVue.vue";
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";

  const router = useRouter();
  const route = useRoute();
  const {store} = useResource()
  const instance = ref<EObject|undefined>(undefined);
import {useDataInstanceHolder} from "@/modelUiBuilder/impl/composeable/InstanceHolder";
import {EObject, URI, EPackageExt} from "@/ecore";
import AppMenu from "@/components/AppMenu.vue";
import MenubarV from "@/components/MenubarV.vue";
import config from "@/config/config";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

  onMounted(async ()=>{
    const {loadResource, getResource, getResourceSet, ecorePackage} = useResource()

    // Load the MetaModel (Conference.ecore) - but don't add it to DataInstanceHolder
    await loadResource(new URI('Conference.ecore'), 'Conference.ecore');

    // Create an empty data resource for instances
    const dataHolder = useDataInstanceHolder();

    // Only create a new resource if one doesn't exist yet
    const resourceSet = getResourceSet();
    const existingResource = resourceSet?.getResource(new URI('data://instances'), false);

    if(!existingResource){
      // Create a resource for data instances
      const dataResource = resourceSet?.createResource(new URI('data://instances'));

      // Store the resource in the DataInstanceHolder
      if(dataResource){
        dataHolder.setResource(dataResource);
      }
    }

    loadup();
  });
  watch(route,()=>{
    loadup();
  })
  const loadup = ()=>{
  const {instanceid} = (router.currentRoute.value.params);
  const dataHolder = useDataInstanceHolder();
  instance.value = dataHolder.getInstance(instanceid as string);
}



</script>

<template>
  <div class="instance-wrapper">
    <AppMenu class="appmenu"></AppMenu>
    <div class="flex">
      <MenubarV></MenubarV>

    <ComposerVue v-model="instance" v-if="instance"></ComposerVue>
    </div>
  </div>
</template>

<style scoped lang="scss">
.instance-wrapper {
  display: grid;
  grid-template-columns: 350px 1fr;
}
.flex{
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
