import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { SpinalBmsNetwork } from "spinal-model-bmsnetwork";

const SIDEBAR = "GraphManagerSideBar";
const networkContextType = "Network";

class CreateNetworkBtn extends SpinalContextApp {
    constructor() {
        super(
            "Create BMS network",
            "This button allows to create new network", {
            icon: "add_circle",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const typeSelected = option.selectedNode.type.get();

        const result = typeSelected.toLowerCase() === networkContextType.toLowerCase() ? true : -1;

        return Promise.resolve(result);
    }


    action(option) {
        spinalPanelManagerService.openPanel("createNetworkDialog", {
            selectedNode: option.selectedNode,
            context: option.context,
            title: "Create BMS Network",
            label: "network Name",
            callback: (networkName, parentId, contextId) => {
                const network = new SpinalBmsNetwork(networkName, SpinalBmsNetwork.nodeTypeName);
                const networkId = SpinalGraphService.createNode({ name: networkName, type: SpinalBmsNetwork.nodeTypeName }, network);
                return SpinalGraphService.addChildInContext(parentId, networkId, contextId, SpinalBmsNetwork.relationName, SPINAL_RELATION_PTR_LST_TYPE);
            }

        })
    }

}

const createNetworkBtn = new CreateNetworkBtn()

spinalContextMenuService.registerApp(SIDEBAR, createNetworkBtn, [3]);

export default createNetworkBtn;