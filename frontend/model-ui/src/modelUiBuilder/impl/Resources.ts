import type {ResourcesI} from "@/modelUiBuilder/api/Resources";
import {type EResource, EResourceSetImpl, URI} from "@/ecore";
import config from "@/config/config";





export default class Resources implements ResourcesI{
    public rs:EResourceSetImpl;
    public res:EResource|undefined;

    constructor(rs:EResourceSetImpl) {
        this.rs = rs;
    }
    async loadResource(uri: URI,path:string): Promise<void> {

        const res = this.rs.createResource(uri);
        const data = await fetch(path);
        const dataAsText = await data.text();
        res.loadFromString(dataAsText)
        console.log(res)
        this.res = res;
    }
    async export(){
        console.log(this.res?.saveToString())
    }


}
