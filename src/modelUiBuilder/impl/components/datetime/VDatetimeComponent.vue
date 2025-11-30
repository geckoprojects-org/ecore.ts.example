<script setup lang="ts">
import {computed, ref, watch} from "vue";
import DatePicker from 'primevue/datepicker';
import FloatLabel from "primevue/floatlabel";
import type {EObject} from "@/ecore";


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
    <FloatLabel>
    <label :for="props.feature.name">{{props.feature.name}}({{props.feature.eType.name}})</label>
    <DatePicker v-model="isnput" :id="props.feature.name"/>
    </FloatLabel>
  </div>
</template>

<style scoped>

</style>
