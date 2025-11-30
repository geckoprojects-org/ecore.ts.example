import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
import webcola, {adaptor, Group} from 'webcola'
import {uniq} from "lodash";

/**
 * Composable to run the layout algorithm on the graph.
 * It uses the `dagre` library to calculate the layout of the nodes and edges.
 */
export function useColaLayout() {
    const { findNode } = useVueFlow()

    const graph = ref(new dagre.graphlib.Graph())

    const previousDirection = ref('LR')

    function layout(nodes:any, edges:any, direction:string) {
        // we create a new graph instance, in case some nodes/edges were removed, otherwise dagre would act as if they were still there

        const colaNodes: { name: string, width: number, height: number }[] = [];
        const colaEdges = [];
        const colaGroups = [];

        const listofContainers: { [key: string]: string[] } = {};
        for (const node of nodes) {
            if (Object.keys(node).includes('parentNode')) {
                if (!listofContainers[node.parentNode]) {
                    listofContainers[node.parentNode] = []
                }
                listofContainers[node.parentNode].push(node.id)
            }
        }
        for (const node of nodes) {
            if (!Object.keys(listofContainers).includes(node.id)) {
                const graphNode = findNode(node.id)
                if (graphNode) {
                    colaNodes.push({name: node.id, width: graphNode.dimensions.width || 150, height: graphNode.dimensions.height || 50})
                }
            }
        }

        for (const edge of edges) {
            colaEdges.push({source: edge.source, target: edge.target})
        }
        for (const [key, value] of Object.entries(listofContainers)) {
            colaGroups.push({leaves: value.map(v => colaNodes.findIndex(s => s.name == v)),name:key})
        }

        const width = 1000,
            height = 1000;

        const nodes1 = [
            {"name": "a", "width": 60, "height": 40},
            {"name": "b", "width": 60, "height": 40},
            {"name": "c", "width": 60, "height": 40},
            {"name": "d", "width": 60, "height": 40},
            {"name": "e", "width": 60, "height": 40},
            {"name": "f", "width": 60, "height": 40},
            {"name": "g", "width": 60, "height": 40}
        ];
        const links = [
            {"source": 1, "target": 2},
            {"source": 2, "target": 3},
            {"source": 3, "target": 4},
            {"source": 0, "target": 1},
            {"source": 2, "target": 0},
            {"source": 3, "target": 5},
            {"source": 0, "target": 5}
        ];
        const groups = [
            {"leaves": [0], "groups": [1]},
            {"leaves": [1, 2]},
            {"leaves": [3, 4]}
        ]

        const cola = adaptor({})
            .linkDistance(200)
            .avoidOverlaps(true)
            .handleDisconnected(true)
            .size([width, height]);
        const res = cola
            .nodes(colaNodes)
            .links(colaEdges)
            .groups(colaGroups as unknown as Group[])
            .start();

        /*for (const node of colaNodes) {
            const anoded = (node as any);
            if(anoded.parent && anoded.parent.bounds){
                anoded.x =  anoded.x-anoded.parent.bounds.x;
                anoded.y =  anoded.y-anoded.parent.bounds.y;
            }
        }*/

        console.log(colaNodes);
        // set nodes with updated positions

        return [
            ...colaGroups.map((node: any) => {
                /*const minx = node.leaves.reduce((acc:any,val:any)=>(acc>val.x)?val.x:acc,Infinity)
                const miny = node.leaves.reduce((acc:any,val:any)=>(acc>val.y)?val.y:acc,Infinity)
                const maxx = node.leaves.reduce((acc:any,val:any)=>(acc<val.x+val.width)?val.x+val.width:acc,0)
                const maxy = node.leaves.reduce((acc:any,val:any)=>(acc<val.y+val.height)?val.y+val.height:acc,0)

                node.width = (maxx-minx+200);
                node.height =  (maxy-miny);
                const graphNode = findNode(node.name);
                if(graphNode){
                    (graphNode.style as any).width= (maxx-minx+200)+'px';
                    (graphNode.style as any).height= (maxy-miny)+'px';
                    (graphNode.style as any).dimensions ={width:maxx-minx+200,height:maxy-miny}
                    graphNode.position = {x: minx, y: miny}
                    return {
                        ...graphNode,
                        position: {x: minx, y: miny}
                    }
                }*/
                const graphNode = findNode(node.name)

                if(graphNode) {
                    (graphNode.style as any).width = (node.bounds.X - node.bounds.x) + 'px';
                    (graphNode.style as any).height = (node.bounds.Y - node.bounds.y) + 'px';
                    (graphNode.style as any).dimensions ={width:node.bounds.x-node.bounds.X,height:node.bounds.y-node.bounds.Y}
                }
                return {
                    ...graphNode,
                    position: {x: node.bounds.x, y: node.bounds.y},
                    dimensions: {width:node.bounds.x-node.bounds.X,height:node.bounds.y-node.bounds.Y}
                }
            }),
            ...colaNodes.map((node: any) => {
                const graphNode = findNode(node.name)
                const anoded = (node as any);
                let x =anoded.x;
                let y =anoded.y;
                if(anoded.parent && anoded.parent.bounds){
                    x =  anoded.x-anoded.parent.bounds.x;
                    y =  anoded.y-anoded.parent.bounds.y;
                }
                return {
                    ...graphNode,
                    position: {x: x-100, y: y-80},
                }
            })

        ]
    }

    return { graph, layout, previousDirection }
}
