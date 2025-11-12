import Vue from "vue";
const { SpinalForgeExtention } = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");
import { MOVE_DEVICES_PANEL_NAME } from "../js/constants"
import moveDevicesDialog from "./moveDevicesPanel.vue";

const panels = [
    {
        name: MOVE_DEVICES_PANEL_NAME,
        vueMountComponent: Vue.extend(moveDevicesDialog),
        panel: {
            title: "Move Devices Panel",
            classname: "spinal_move_devices_panel",
            closeBehaviour: "hide",
        },
        style: {
            width: "600px",
            height: "500px",
            "min-width": "600px",
            left: "400px",
        },
    }
];


for (const data of panels) {
    const extension = SpinalForgeExtention.createExtention(data);
    SpinalForgeExtention.registerExtention(data.name, extension);
}