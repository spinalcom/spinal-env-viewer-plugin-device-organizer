<template>
    <md-dialog :md-active.sync="showDialog" @md-closed="closeDialog(false)" :md-click-outside-to-close="false">
        <md-dialog-title>{{ title }}</md-dialog-title>
        <md-dialog-content>
            <md-field>
                <label>{{ label }}</label>
                <md-input v-model="inputValue"></md-input>
            </md-field>

        </md-dialog-content>
        <md-dialog-actions>
            <md-button class="md-primary" @click="closeDialog(false)">Close</md-button>
            <md-button class="md-primary" @click="closeDialog(true)"
                :disabled="!(inputValue.trim().length > 0)">Save</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
export default {
    name: "createNetworkDialog",
    props: ["onFinised"],
    data() {
        return {
            showDialog: true,
            inputValue: "",
            title: "",
            label: "",
            selectedNode: null,
            context: null,
            callback: null
        };
    },
    methods: {
        opened(option) {
            // console.log(option);
            this.title = option.title;
            this.label = option.label;
            this.selectedNode = option.selectedNode;
            this.context = option.context;
            this.callback = option.callback;
        },

        removed(option) {
            if (option.closeResult && option.inputValue.length > 0 && typeof this.callback === "function") {
                const name = option.inputValue.trim();
                const parentId = this.selectedNode.id.get();
                const contextId = this.context.id.get();

                this.callback(name, parentId, contextId);
            }

            this.showDialog = false;
        },

        closeDialog(closeResult) {
            if (typeof this.onFinised === "function") {
                this.onFinised({ closeResult, inputValue: this.inputValue.trim() });
            }
        },
    }
}
</script>

<style scoped></style>