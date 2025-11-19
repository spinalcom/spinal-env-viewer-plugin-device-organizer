<template>
    <md-dialog :md-active.sync="showDialog" @md-closed="closeDialog(false)" :md-click-outside-to-close="false">
        <md-dialog-title>Create Endpoint</md-dialog-title>
        <md-dialog-content class="dialogContent">
            <md-field>
                <label>name</label>
                <md-input v-model="endpoint.name"></md-input>
            </md-field>

            <md-field>
                <label>Path</label>
                <md-input v-model="endpoint.path"></md-input>
            </md-field>

            <md-field>
                <label for="dataType">data type</label>
                <md-select v-model="endpoint.dataType" name="dataType" id="dataType">
                    <md-option v-for="type in dataTypes" :key="type" :value="type">{{ type }}</md-option>
                </md-select>
            </md-field>

            <md-field>
                <label>Current Value</label>
                <md-input v-model="endpoint.currentValue"></md-input>
            </md-field>

            <md-field>
                <label>Unit</label>
                <md-input v-model="endpoint.unit"></md-input>
            </md-field>

            <md-checkbox v-model="endpoint.addToEndpointGroup" class="md-primary">Add to endpoint group</md-checkbox>

            <md-field v-if="endpoint.addToEndpointGroup">
                <label>endpoint group name</label>
                <md-input v-model="endpoint.endpointGroupName"></md-input>
                <span class="md-helper-text">To use an existing endpoint group, enter the same group name.</span>
            </md-field>

        </md-dialog-content>
        <md-dialog-actions>
            <md-button class="md-primary" @click="closeDialog(false)">Close</md-button>
            <md-button class="md-primary" @click="closeDialog(true)"
                :disabled="!(endpoint.name.trim().length > 0)">Save</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>

import { SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from "spinal-env-viewer-graph-service";
import { InputDataEndpointDataType, SpinalBmsEndpoint, SpinalBmsEndpointGroup } from "spinal-model-bmsnetwork";

export default {
    name: "createEndpointDialog",
    props: ["onFinised"],
    data() {

        this.dataTypes = Object.keys(InputDataEndpointDataType).filter(key => isNaN(Number(key))); // Get only string keys

        return {
            showDialog: true,
            selectedNode: null,
            context: null,
            endpoint: {
                name: "",
                path: "",
                dataType: this.dataTypes[0],
                currentValue: "",
                unit: "",
                addToEndpointGroup: false,
                endpointGroupName: "",
            }
        };
    },
    methods: {
        opened(option) {
            this.selectedNode = option.selectedNode;
            this.context = option.context;

        },

        async removed(option) {
            if (option.closeResult) {
                const parentNodeId = await this._getParentNode(this.endpoint);
                const { name, currentValue: value, dataType, path, unit } = this.endpoint;
                const valueFormatted = this._formatCurrentValue(value, dataType);

                const endpointModel = new SpinalBmsEndpoint(name, path, valueFormatted, unit, dataType, SpinalBmsEndpoint.nodeType);

                const { currentValue, ...rest } = this.endpoint;

                const endpointNodeId = SpinalGraphService.createNode({ type: SpinalBmsEndpoint.nodeTypeName, ...rest }, endpointModel);
                await SpinalGraphService.addChildInContext(parentNodeId, endpointNodeId, this.context.id.get(), SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE);
            }

            this.showDialog = false;
        },

        _formatCurrentValue(currentValue, dataType) {
            switch (dataType) {
                case InputDataEndpointDataType.Boolean:
                    return this.convertToBoolean(currentValue);
                case InputDataEndpointDataType.Integer:
                case InputDataEndpointDataType.Integer16:
                case InputDataEndpointDataType.Real:
                case InputDataEndpointDataType.Double:
                case InputDataEndpointDataType.Long:
                    return Number(currentValue);
                default:
                    return currentValue;
            }
        },


        convertToBoolean(value) {
            const val = value.toString().toLowerCase().trim();
            if (val === "true" || val === "yes") return true;
            if (val === "false" || val === "no") return false;

            if (!isNaN(value)) {
                const num = Number(value);
                return num >= 1 ? 1 : 0;
            }

            return Boolean(value);
        },

        _getParentNode(endpointData) {
            if (!endpointData.addToEndpointGroup) return this.selectedNode.id.get();
            return this._getOrCreateEndpointGroupNode(endpointData.endpointGroupName);
        },

        async _getOrCreateEndpointGroupNode(groupName) {
            const deviceId = this.selectedNode.id.get();
            const endpointGroups = await SpinalGraphService.getChildren(deviceId, [SpinalBmsEndpointGroup.relationName]);
            let groupNode = endpointGroups.find(group => group.name.get() === groupName);
            if (groupNode) return groupNode.id.get();

            // create new endpoint group
            return this._createNewEndpointGroup(deviceId, groupName);
        },

        _createNewEndpointGroup(deviceId, groupName) {
            const groupModel = new SpinalBmsEndpointGroup(groupName);
            const nodeId = SpinalGraphService.createNode({ name: groupName, type: SpinalBmsEndpointGroup.nodeType }, groupModel);
            return SpinalGraphService.addChildInContext(deviceId, nodeId, this.context.id.get(), SpinalBmsEndpointGroup.relationName, SPINAL_RELATION_PTR_LST_TYPE)
                .then(() => nodeId);
        },

        closeDialog(closeResult) {
            if (typeof this.onFinised === "function") {
                this.onFinised({ closeResult });
            }
        },
    }
}
</script>

<style scoped>
.dialogContent {
    min-width: 400px;
}
</style>