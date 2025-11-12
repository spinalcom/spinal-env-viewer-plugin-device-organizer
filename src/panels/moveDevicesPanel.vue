<template>
    <div class="dialogContainer">

        <md-button class="md-fab md-primary md-fab-bottom-right" :disabled="disableLinkBtn" title="move devices"
            @click="linkDevicesToNetwork">
            <md-icon>swipe</md-icon>
        </md-button>

        <div class="content">
            <div class="title">source</div>
            <div class="list">
                <v-treeview dark selectable open-on-click hoverable transition item-text="name" item-key="id"
                    selected-color="primary" v-model="devicesToMove" :items="sourceTree">
                </v-treeview>
            </div>
        </div>

        <div class="content">
            <div class="title">destination</div>
            <div class="list">
                <v-treeview dark open-on-click hoverable transition item-text="name" item-key="id"
                    selected-color="primary" v-model="destinationNodes" :items="destinationTree">
                    <template #label="{ item }">
                        <!-- stop pour éviter que le clic ne soit “avalé” par l’expansion -->
                        <div @click.stop="onNodeClicked(item)"
                            :class="{ 'selected': (destinationNode && item.id === destinationNode.id) }">
                            {{ item.name }}
                        </div>
                    </template>
                </v-treeview>
            </div>
        </div>
    </div>




    <!--  <md-dialog class="selectOrganDialog" :md-active.sync="showDialog" @md-closed="closeDialog(false)">
        <md-dialog-title class="title">Move Devices</md-dialog-title>
        <md-dialog-content class="dialogContainer">
            <md-steppers :md-active-step.sync="active" md-linear>
                <md-step :id="steps.first.id" :md-label="steps.first.title" :description="steps.first.description"
                    :md-done.sync="done.first" :md-editable="false">
                    <div class="selectDevice">
                        <v-treeview dark selectable open-on-click hoverable transition item-text="name" item-key="id"
                            selected-color="primary" v-model="devicesToMove" :items="sourceTree">
                        </v-treeview>
                    </div>
                </md-step>

                <md-step :id="steps.second.id" :md-label="steps.second.title" :description="steps.second.description"
                    :md-done.sync="done.second" :md-editable="false">
                    second
                </md-step> 


     </md-steppers> 

    </md-dialog-content>

    <md-dialog-actions>
        <md-button class="md-primary" @click="closeDialog(false)">Close</md-button>
        <md-button class="md-primary" v-if="!hideNextButton" :disabled="disableNextButton"
            @click="goToNext">Next</md-button>
    </md-dialog-actions>
    </md-dialog>-->
</template>
<script>
import { SpinalBmsDevice, SpinalBmsNetwork } from 'spinal-model-bmsnetwork';
// import TreeView from "./components/treeList.vue";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { TreeViewComponent } from "@syncfusion/ej2-vue-navigations";
import { initial } from 'lodash';

export default {
    name: "MoveDevicesPanel",
    components: {
        // TreeView,
        "ejs-treeview": TreeViewComponent,
    },
    data() {

        this.steps = {
            first: { id: "selectDevices", title: "Select Devices To Move", description: "Select the devices you want to move" },
            second: { id: "selectDestination", title: "Select Destination", description: "Select the destination organ" },
            // third: { id: "moveOptions", title: "Move options", description: "Select the move options" },
        }

        return {
            done: {
                first: false,
                second: false,
                // third: false,
            },
            active: this.steps.first.id,
            devicesToMove: [],
            destinationNode: null,
            loading: false,
            showDialog: true,
            selectedNode: null,
            context: null,
            sourceTree: [],
            destinationTree: [],
            nodesStored: {},
        };
    },
    methods: {
        async opened(option) {
            await this.initializeTreeViewData(option);
        },

        async initializeTreeViewData(option = {}) {
            // reset data
            this.sourceTree = [];
            this.destinationTree = [];
            this.devicesToMove = [];
            this.destinationNode = null;
            this.nodesStored = {};
            // end reset data

            this.loading = true;
            this.context = option.context || this.context;
            this.selectedNode = option.selectedNode || this.selectedNode;

            // get networks under the selected organ
            this.sourceTree = await this.getSourceTree(this.selectedNode);
            this.destinationTree = await this.getDestinationTree(this.context);

            this.loading = false;

        },

        async getSourceTree(selectedNode) {
            const networks = await this.getNetworks(selectedNode)
            const promises = networks.map(networkNodeRef => this.getNetworkTree(networkNodeRef));
            return Promise.all(promises);
        },

        async getDestinationTree(contextNode) {
            const organs = await SpinalGraphService.getChildren(contextNode.id.get(), ["hasBmsNetworkOrgan"]);
            const promises = organs.map(async organNodeRef => {
                const organ = organNodeRef.get();
                const networksRefs = await this.getNetworks(organNodeRef)
                organ.children = networksRefs.map(el => el.get());
                return organ;
            });

            return Promise.all(promises);
        },

        goToNext() {
            if (this.active === this.steps.first.id) {
                this.active = this.steps.second.id;
            } else if (this.active === this.steps.second.id) {
                // this.active = this.steps.third.id;
            }
        },

        removed(option) {
            if (option.closeResult) {
            }
            this.showDialog = false;
        },

        closeDialog(closeResult) {
            if (typeof this.onFinised === "function") {
                this.onFinised({ closeResult });
            }
        },

        getNetworks(node) {
            if (node.type.get() === SpinalBmsNetwork.nodeTypeName) {
                return Promise.resolve([node]);
            }

            return SpinalGraphService.getChildren(node.id.get(), [SpinalBmsNetwork.relationName]);
        },

        async getNetworkTree(networkNodeRef) {
            const network = networkNodeRef.get();
            this.nodesStored[network.id] = network; // store the network node

            const devices = await SpinalGraphService.getChildren(network.id, [SpinalBmsDevice.relationName]);
            network.children = devices.map(device => {
                const node = device.get();
                node.parentId = network.id;

                this.nodesStored[node.id] = node; // store the device node
                return node;
            });

            return network;
        },

        onNodeClicked(node) {
            if (node.type === SpinalBmsNetwork.nodeTypeName) this.destinationNode = node;
        },


        async linkDevicesToNetwork() {
            this.loading = true;
            const contextId = this.context.id.get();
            const destinationId = this.destinationNode.id;


            for (const deviceNodeId of this.devicesToMove) {
                const deviceNode = this.nodesStored[deviceNodeId];
                const sourceId = deviceNode.parentId;
                const nodeId = deviceNode.id;

                if (deviceNode.type !== SpinalBmsDevice.nodeTypeName) continue;

                await this.moveNode(nodeId, sourceId, destinationId, contextId);
            }

            await this.initializeTreeViewData();
        },

        moveNode(nodeId, sourceId, destinationId, contextId) {
            return SpinalGraphService.moveChildInContext(sourceId, destinationId, nodeId, contextId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
        },



    },

    computed: {
        disableNextButton() {
            if (this.active === this.steps.first.id && this.devicesToMove.length === 0) return true;
        },

        hideNextButton() {
            return this.active === this.steps.second.id;
        },

        disableLinkBtn() {
            return this.devicesToMove.length === 0 || this.destinationNode === null;
        }
    },

    watch: {
        devvicesToMove(newVal) {
            this.done.first = newVal.length > 0;
        }
    }


}
</script>

<style scoped>
.title {
    text-align: center;
}

.dialogContainer {
    width: calc(100% - 30px) !important;
    height: calc(100% - 30px) !important;
    margin: auto;
    display: flex;
    justify-content: space-around;
    /* gap: 10px;
    padding: 10px; */
}

.dialogContainer .content {
    width: calc(50% - 10px);
    /* (height - 2px) to display border */
    height: calc(100% - 2px);
    border: 1px solid grey;
    border-radius: 5px;
}

.dialogContainer .content .title {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid grey;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: capitalize;
}

.dialogContainer .content .list {
    width: 100%;
    height: calc(100% - 40px);
    overflow: auto;
}

.selectDevice {
    height: 100%;
    overflow: auto;
}

.selected {
    background-color: #00f;
}
</style>