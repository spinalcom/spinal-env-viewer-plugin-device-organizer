<template>
    <md-list :md-expand-single="expandSingle">
        <md-list-item md-expand :md-expanded.sync="expandNews" v-for="item in treeData" :key="item.id">
            <span class="md-list-item-text">{{ item.name }}</span>

            <md-list slot="md-expand">
                <md-list-item class="md-inset" v-for="child in item[childrenKey]" :key="child.id">
                    {{ child.name }}
                </md-list-item>
            </md-list>
        </md-list-item>

    </md-list>
</template>

<script>
export default {
    name: "TreeList",
    props: {
        treeData: {
            type: Array,
            required: true
        },
        childrenKey: {
            type: String,
            default: "children"
        },
    },
    data() {
        return {};
    },
    methods: {},
};
</script>

<style scoped></style>