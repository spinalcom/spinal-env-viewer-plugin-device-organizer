import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalBmsNetwork } from "spinal-model-bmsnetwork";
import { BACNET_ORGAN_TYPE } from "spinal-model-bacnet";
import { OPCUA_ORGAN_TYPE } from "spinal-model-opcua";

const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { MOVE_DEVICES_PANEL_NAME, SIDEBAR } from "../js/constants";


class MoveDevicesToAnotherOrgan extends SpinalContextApp {
    constructor() {
        super("Move devices to another bacnet organ", "This button allows to move a device to another organ", {
            icon: "low_priority",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const type = option.selectedNode.type.get();

        const typesAllowed = [BACNET_ORGAN_TYPE, OPCUA_ORGAN_TYPE, SpinalBmsNetwork.nodeTypeName];
        if (typesAllowed.includes(type)) return 1;

        return -1;
    }

    async action(option) {
        spinalPanelManagerService.openPanel(MOVE_DEVICES_PANEL_NAME, option);
    }
}


const moveDevicesToAnotherOrgan = new MoveDevicesToAnotherOrgan()
spinalContextMenuService.registerApp(SIDEBAR, moveDevicesToAnotherOrgan, [3]);
export default moveDevicesToAnotherOrgan;