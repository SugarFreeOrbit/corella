<template>
    <el-dialog :visible="true" center
               class="projectBuilder__content__roles__add"
               @close="closeModal"
               :close-on-click-modal="false">
        <el-form :model="newRoleData">
            <el-form-item label="Role name">
                <el-input autocomplete="off" v-model="newRoleData.name"></el-input>
            </el-form-item>
            <el-form-item label="Manage">
                <el-switch v-model="newRoleData.isManager"></el-switch>
            </el-form-item>
            <el-form-item label="Create">
                <el-switch v-model="newRoleData.isCreator"></el-switch>
            </el-form-item>
            <el-form-item label="Delete">
                <el-switch v-model="newRoleData.isDestroyer"></el-switch>
            </el-form-item>
            <el-form-item label="Edit">
                <el-switch v-model="newRoleData.isEditor"></el-switch>
            </el-form-item>
            <el-form-item label="Create Hotfixes">
                <el-switch v-model="newRoleData.createHotfixes"></el-switch>
            </el-form-item>
            <el-form-item label="Edit Hotfixes">
                <el-switch v-model="newRoleData.editHotfixes"></el-switch>
            </el-form-item>
            <el-form-item label="Delete Hotfixes">
                <el-switch v-model="newRoleData.deleteHotfixes"></el-switch>
            </el-form-item>
            <el-form-item v-for="startingColumn in projectBuilder.columns"
                          v-bind:key="startingColumn.name"
                          class="projectBuilder__content__roles__add__transitions">
                {{startingColumn.name}} <i class="el-icon-right"></i> {{" "}}
                <el-select v-model="newRoleData.itm[startingColumn.name]" multiple
                           placeholder="Select transitions">
                    <el-option v-for="targetColumn in projectBuilder.columns" :label="targetColumn.name"
                               :key="targetColumn.name" :value="targetColumn.name"
                               v-if="startingColumn.name !== targetColumn.name"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item style="text-align: center">
                <el-button @click="closeModal">Cancel</el-button>
                <el-button type="primary" @click="addRole">Create</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
    export default {
        name: "add-new-rol-modal",
        props: {
            projectBuilder: {
                type: Object,
                require: true
            },
        },
        data() {
            return {
                newRoleData: {
                    visible: false,
                    name: '',
                    isManager: false,
                    isCreator: false,
                    isDestroyer: false,
                    isEditor: false,
                    createHotfixes: false,
                    editHotfixes: false,
                    deleteHotfixes: false,
                    itm: {},
                    columns: []
                }
            }
        },
        methods: {
            addRole: function () {
                if (this.projectBuilder.roles.find(role => role.name === this.newRoleData.name) || this.newRoleData.name.length === 0) {
                    this.$notify({
                        title: 'Validation error',
                        message: 'Role names must be unique',
                        type: 'error'
                    });
                } else {
                    this.projectBuilder.roles.push({
                        name: this.newRoleData.name,
                        isManager: this.newRoleData.isManager,
                        isEditor: this.newRoleData.isEditor,
                        isDestroyer: this.newRoleData.isDestroyer,
                        isCreator: this.newRoleData.isCreator,
                        createHotfixes: this.newRoleData.createHotfixes,
                        editHotfixes: this.newRoleData.editHotfixes,
                        deleteHotfixes: this.newRoleData.deleteHotfixes,
                        issueTransitionMatrix: this.newRoleData.itm
                    });
                    this.closeModal()
                }
            },
            closeModal() {
                this.$emit('close')
            }
        }
    }
</script>

<style lang="scss">
    .projectBuilder__content__roles__add {
        .el-dialog__body {
            padding-top: 10px !important;
        }
    }
</style>