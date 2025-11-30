<script setup lang="ts">
import {computed, ref, toRaw, watch} from "vue";
import Menubar from "primevue/menubar";
import Badge from "primevue/badge";
import InputText from "primevue/inputtext";
import Avatar from "primevue/avatar";
import Breadcrumb from "primevue/breadcrumb";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import Divider from "primevue/divider";
import {DefaultApi} from "../../openapi/client";
import {useToast} from "primevue/usetoast";
import Tree from 'primevue/tree';
//@ts-ignore
import XmlViewer from 'vue3-xml-viewer'
import ScrollPanel from 'primevue/scrollpanel';
import {useResource} from "@/modelUiBuilder/impl/composeable/Resource";
import Resources from "@/modelUiBuilder/impl/Resources";
import config from "@/config/config";
import {URI} from "@/ecore/URI";
import {useInstanceHolder} from "@/modelUiBuilder/impl/composeable/InstanceHolder";
import ShortUniqueId from "short-unique-id";
import {type EObject, EPackage, isEPackage} from "@/ecore";

const {store,getResourceSet}= useResource();
const uid = new ShortUniqueId({ length: 10 });
const toast = useToast();
const emit = defineEmits<{
  import: []
}>()
const items = ref([
  {
    label: 'MDO',
    icon: 'pi pi-cloud',
    items: [
      {
        label: 'Import',
        icon: 'pi pi-cloud-download',
        command: () => {
            visible.value = true;
        }
      },
      {
        label: 'Export',
        icon: 'pi pi-cloud-upload',
        command: () => {


          /*const rs = getResourceSet()
          );
          const pack = useResource().getResourceSet()?.getPackageRegistry().getPackage('http://de.test.epackage/test.ecore');
          res?.eContents().add(pack)
          console.log(res.saveToString());*/
          const res =  getResourceSet()?.createResource(new URI('http://de.test.epackage/export.ecore'));
          useInstanceHolder().instances.value.forEach(((instances:EObject)=> {
            const ri = toRaw(instances);
            if (ri.eClass().name == 'EPackage') {

              res?.eContents().add(ri)
              //res?.eContents().addAll(instances.eAllContents());

            }
            console.log(res?.saveToString())
            //res?.eContents().addAll(instances.eAllContents());
            /*for(const cont of instances.eAllContents()){
              res?.eContents().add(cont);
            }*/
            //}))

            //console.log(res?.saveToString());

            toast.add({severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 10000});
          }));
        }
      },

    ]
  },
  {
    label: 'File',
    icon: 'pi pi-file',
    items: [
      {
        label: 'Import',
        icon: 'pi pi-file-download',

      },
      {
        label: 'Export',
        icon: 'pi pi-file-upload',
        command: () => {

        }
      }
    ]
  },
  {
    label: 'Rearange',
    icon: 'pi pi-star',
    command: () => {
      emit('import')
    }
  },

]);
const home = ref({
  icon: 'pi pi-home'
});
const itemsb = ref([
  { label: 'Modeling' },

]);
const visible = ref(false);
const visibleSave = ref(false);
const loading = ref(false);
const loadingSub = ref(false);
const position = ref('center');
const itemsData = ref<any>([]);
const model = ref();
const selectedKey = ref('');
const itemsDataTree = computed(()=>{
  return itemsData.value.map((e:string)=>{return {
    key:e,label:e,icon: 'pi pi-qrcode'
  }})
})

watch(visible,async ()=>{
  if(visible.value){
    loading.value = true;
    try{
      itemsData.value = (await new DefaultApi().loadAll1()).data;
    }catch (e){
      toast.add({ severity: 'error', summary: 'Response Error', detail: 'Coudn,t receive Information: '+e, life: 3000 });
    }finally{
      loading.value = false;
    }

  }
})
watch(selectedKey,async ()=>{
  if(selectedKey.value){
    loadingSub.value = true;
    model.value = '';
    try{
      model.value = (await new DefaultApi().load1(Object.keys(selectedKey.value)[0])).data;
    }catch (e){
      toast.add({ severity: 'error', summary: 'Response Error', detail: 'Coudn,t receive Information: '+e, life: 3000 });
    }finally{
      loadingSub.value = false;
    }

  }
})
const importModel = ()=>{

      const rs = getResourceSet()
      const res =  rs?.createResource(new URI(Object.keys(selectedKey.value)[0]+'.ecore'))
      //const res =  rs?.createResource("tmp.ecore")
      console.log(toRaw(model.value.replaceAll('http:%2F%2Fjena.queryModel.de%2Fquery',"ecore:EClass http://jena.queryModel.de/query")))
      //res?.loadFromString(model.value.replaceAll('http:%2F%2Fjena.queryModel.de%2Fquery',""));       http://jena.queryModel.de/query
      res?.loadFromString(model.value.replaceAll('http:%2F%2Fjena.queryModel.de%2Fquery'," http://jena.queryModel.de/query"));
      //res?.loadFromString(model.value);
      console.log(res);
      for(const cont of res.eAllContents()){
        const id =uid.rnd();
        useInstanceHolder().setInstance(id,cont)
      }


}
</script>

<template>

  <Menubar :model="items" class="margin">




    <template #end>
      <div class="flex items-center gap-2">
        <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />
      </div>
    </template>
  </Menubar>

  <Dialog v-model:visible="visible" header="Load Model from Repo" :style="{ width: '75rem' }" :position="position" :modal="true" :draggable="false">

    <div class="card flex">
      <div class="m-5 list">
        <template v-if="loading">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2"></Skeleton>
        </template>
        <template v-else>
          <Tree :value="itemsDataTree" :filter="true" filterMode="lenient" v-model:selectionKeys="selectedKey" selectionMode="single" class="w-full md:w-[30rem]">

          </Tree>
        </template>
      </div>

      <Divider layout="vertical" />

      <div class="m-0 oh">
        <ScrollPanel style="width: 100%; height:100%">
          <XmlViewer :xml="model" theme="dark" id="xml" v-if="model"/>
          <div class="noSelection" v-if="Object.keys(selectedKey).length==0">

            <div class="box">
                <span>&lt;/&gt;</span>
            </div>
            <span> Plaese Select a Model </span>

          </div>
          <div class="loadindScal" v-if="loadingSub">
            <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
            <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
            <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>
            <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
            <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
            <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>
            <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
            <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
            <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>

          </div>
        </ScrollPanel>
      </div>


    </div>


    <div class="flex-end">

      <Button type="button" label="Import"  :disabled="!model" @click="visible = false;importModel();"></Button>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
.card {
  display: grid;
  grid-template-columns: 33% 30px 1fr;
  grid-template-rows: 500px;
  .list{
    display: flex;
    flex-direction: column;
    gap: 15px;

  }
}
.oh{
  overflow:hidden;
}
.flex-end{
  display: flex;
  flex-direction: row-reverse;
  margin-top: 15px;
}
.loadindScal{
  display: flex;
  flex-direction: column;
  gap: 10px;
}
#xml.dark {
  --xml-viewer-bracket-color: #5d636c;
  --xml-viewer-assignment-color: #b392f0;
  --xml-viewer-quote-color: #9ecbff;
  --xml-viewer-attribute-name-color: #6241a3;
  --xml-viewer-attribute-value-color: #405b7b;
  --xml-viewer-cdata-content-color: #9ecbff;
  --xml-viewer-element-content-color: #1c365a;
  --xml-viewer-element-name-color: #7e32b4;
  --xml-viewer-remark-content-color: #6a737d;
}
.noSelection{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
  color: #807f7f;
}
.box{
  border-radius: 15px;
  background: #f2efef;
  width: 100px;
  height: 100px;
  color: #fff;
  font-size: 56px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 5px #ccc;
  margin-bottom: 30px;

}
</style>
