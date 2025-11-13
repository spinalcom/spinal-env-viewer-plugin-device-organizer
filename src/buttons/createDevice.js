import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { SpinalBmsDevice, SpinalBmsNetwork } from "spinal-model-bmsnetwork";

const SIDEBAR = "GraphManagerSideBar";
const networkContextType = "Network";

class CreateDeviceBtn extends SpinalContextApp {
    constructor() {
        super(
            "Create BMS Device Network",
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
        spinalPanelManagerService.openPanel("createNetworkDialog", {
            selectedNode: option.selectedNode,
            context: option.context,
            title: "Create BMS Device",
            label: "Device Name",
            callback: (deviceName, parentId, contextId) => {
                const device = new SpinalBmsDevice(deviceName, SpinalBmsDevice.nodeTypeName);
                const deviceId = SpinalGraphService.createNode({ name: deviceName, type: SpinalBmsDevice.nodeTypeName }, device);
                return SpinalGraphService.addChildInContext(parentId, deviceId, contextId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
            }

        })
    }

}

const createDeviceBtn = new CreateDeviceBtn()

spinalContextMenuService.registerApp(SIDEBAR, createDeviceBtn, [3]);

export default createDeviceBtn;