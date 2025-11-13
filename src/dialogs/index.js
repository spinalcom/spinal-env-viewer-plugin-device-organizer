import Vue from "vue";
const { SpinalMountExtention } = require("spinal-env-viewer-panel-manager-service");

import CreateNetworkDialog from "./createNetworkDialog.vue";

const dialogs = [{
    name: "createNetworkDialog",
    vueMountComponent: Vue.extend(CreateNetworkDialog),
    parentContainer: document.body
}];



for (let index = 0; index < dialogs.length; index++) {
    SpinalMountExtention.mount(dialogs[index]);
}