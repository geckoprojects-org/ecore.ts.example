<script setup lang="ts">
  import {computed} from "vue";

  import {useComponentRegistry} from "@/modelUiBuilder/impl/composeable/ComponentRegistry";
  import type {EClass, EObject} from "@/ecore";

  const {cp} = useComponentRegistry()
  const model = defineModel<EClass|EObject>();
  const componentList = computed(()=>{
      return model.value?.eClass().eAllStructuralFeatures
  })
</script>

<template>



  <!--<Card class="margin" v-if="model">
    <template #title>{{model.eClass().name}}</template>
    <template #content>-->
  <div class="composer">
    <template v-if="model">
      <div class="margin">
        <h2>{{model.eClass().name}}</h2>
      </div>
    </template>

    <template v-for="structFeature in componentList" :key="structFeature.name"  >
      <div class="margin">
        <component :is="cp.getComponent(structFeature)" v-bind="{feature:structFeature}" v-model="model" ></component>
      </div>
    </template>

  </div>
  <!-- </template>
 </Card>-->
</template>

<style scoped>
.margin{
  margin: 15px 35px;
}
.margin_b{
  margin-bottom: 15px;
}
</style>
