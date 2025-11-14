import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { SpinalBmsDevice, SpinalBmsNetwork } from "spinal-model-bmsnetwork";
import { NETWORK_DIALOG, SIDEBAR } from "../js/constants";

class CreateDeviceBtn extends SpinalContextApp {
    constructor() {
        super(
            "Create BMS Device",
            "This button allows to create new Device", {
            icon: "add_circle",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const typeSelected = option.selectedNode.type.get();

        const result = typeSelected === SpinalBmsNetwork.nodeTypeName ? true : -1;
        return Promise.resolve(result);
    }


    action(option) {
        spinalPanelManagerService.openPanel(NETWORK_DIALOG, {
            selectedNode: option.selectedNode,
            context: option.context,
            title: "Create BMS Device",
            label: "Device Name",
            callback: (deviceName, parentId, contextId) => {
                const device = new SpinalBmsDevice(deviceName, SpinalBmsDevice.nodeTypeName);
                const deviceId = SpinalGraphService.createNode({ name: deviceName, type: SpinalBmsDevice.nodeTypeName }, device);
                const deviceNode = SpinalGraphService.getRealNode(deviceId);
                if (deviceNode) deviceNode.info.add_attr({ idNetwork: deviceId });

                return SpinalGraphService.addChildInContext(parentId, deviceId, contextId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
            }

        })
    }

}

const createDeviceBtn = new CreateDeviceBtn()

spinalContextMenuService.registerApp(SIDEBAR, createDeviceBtn, [3]);

export default createDeviceBtn;