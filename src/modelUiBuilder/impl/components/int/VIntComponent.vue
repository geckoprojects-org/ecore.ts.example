<script setup lang="ts">
import {computed, ref, watch} from "vue";
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import {EObject} from "@/ecore";



  const props = defineProps(['feature'])
  const inst = defineModel<EObject>();
  const isnput = computed({
  get:()=>{
    try{
      return  inst?.value?.eGet(props.feature);
    }catch (e){
      return 0
    }

},set:(val)=>{
      inst.value?.eSet(props.feature,val)
    }});

</script>

<template>

  <div class="input">
    <FloatLabel>
    <InputText v-model="isnput" :id="props.feature.name" />
    <label :for="props.feature.name">{{props.feature.name}}</label><br>
      </FloatLabel>
  </div>
</template>

<style scoped>

</style>
