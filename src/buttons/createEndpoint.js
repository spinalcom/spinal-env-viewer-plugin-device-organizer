import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalBmsDevice, SpinalBmsEndpointGroup } from "spinal-model-bmsnetwork";
import { ENDPOINT_DIALOG, SIDEBAR } from "../js/constants";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");


class CreateEndpointBtn extends SpinalContextApp {
    constructor() {
        super(
            "Create Endpoint",
            "This button allows to create new Endpoint", {
            icon: "add_circle",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const typeSelected = option.selectedNode.type.get();

        const result = [SpinalBmsDevice.nodeTypeName, SpinalBmsEndpointGroup.nodeTypeName].includes(typeSelected) ? true : -1;
        return Promise.resolve(result);
    }

    action(option) {
        spinalPanelManagerService.openPanel(ENDPOINT_DIALOG, option);
    }
}


const createEndpointBtn = new CreateEndpointBtn();
spinalContextMenuService.registerApp(SIDEBAR, createEndpointBtn, [3]);
export default createEndpointBtn;