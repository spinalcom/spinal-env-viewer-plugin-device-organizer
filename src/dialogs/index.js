import Vue from "vue";
const { SpinalMountExtention } = require("spinal-env-viewer-panel-manager-service");

import CreateNetworkDialog from "./createNetworkDialog.vue";
import createEndpointDialog from "./createEndpointDialog.vue";
import { ENDPOINT_DIALOG, NETWORK_DIALOG } from "../js/constants";

const dialogs = [{
    name: NETWORK_DIALOG,
    vueMountComponent: Vue.extend(CreateNetworkDialog),
    parentContainer: document.body
}, {
    name: ENDPOINT_DIALOG,
    vueMountComponent: Vue.extend(createEndpointDialog),
    parentContainer: document.body
}];



for (let index = 0; index < dialogs.length; index++) {
    SpinalMountExtention.mount(dialogs[index]);
}