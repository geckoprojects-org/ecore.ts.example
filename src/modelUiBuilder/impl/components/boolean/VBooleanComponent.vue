<script setup lang="ts">
import {computed, ref, watch} from "vue";

import FloatLabel from 'primevue/floatlabel';
import {EObject} from "@/ecore";
import ToggleButton from "primevue/togglebutton";


  const props = defineProps(['feature'])
  const inst = defineModel<EObject>();
  const isnput = computed({
  get:()=>{
    return inst?.value?.eGet(props.feature)
},set:(val)=>{
      inst.value?.eSet(props.feature,val)
    }});

</script>

<template>

  <div class="input">

      <label :for="props.feature.name">{{props.feature.name}}({{props.feature.eType.name}})</label><br>
      <ToggleButton v-model="isnput" onLabel="True" offLabel="False" :id="props.feature.name"  />


  </div>
</template>

<style scoped>

</style>
