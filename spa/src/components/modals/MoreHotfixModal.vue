<template>
    <el-dialog :visible="true" :before-close="close">
        <div v-if="!canEditHotfixes" class="issue__content" v-loading="modalLoading">
            <p class="issue__content__title">{{currentHotfix.title}}</p>
            <hr>
            <p class="issue__content_description">{{currentHotfix.description}}</p>
            <div class="issue__content_images">
                <app-file v-for="file in currentHotfix.files"
                          :url="`/projects/${projectId}/hotfixes/${currentHotfix._id}/attached/${file._id}`"
                          :file="file"
                          :width="100"
                          :height="100">
                </app-file>
            </div>
            <div class="issue__content__control">
                <el-button type="danger" @click="deleteHotfix" v-if="canDeleteHotfixes">Delete</el-button>
                <el-select v-model="state" placeholder="Move this issue to..." class="issue__content__control__move" @change="moveHotfix">
                    <el-option v-for="col in states"
                               :key="col.value"
                               :label="col.label"
                               :value="col.value">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="issue__content" v-else v-loading="modalLoading">
            <el-form>
                <el-form-item label="Title">
                    <el-input v-model="currentHotfix.title"></el-input>
                </el-form-item>
                <hr>
                <el-form-item label="Description">
                    <el-input type="textarea" :rows="6" v-model="currentHotfix.description"></el-input>
                </el-form-item>
                <el-form-item label="Priority">
                    <el-select v-model="priority" placeholder="Move this issue to..." class="issue__content__control__move">
                        <el-option v-for="item in priorities"
                                   :key="item.value"
                                   :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="State">
                    <el-select v-model="state" placeholder="Move this issue to..." class="issue__content__control__move">
                        <el-option v-for="item in states"
                                   :key="item.value"
                                   :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <input style="display: none" placeholder="upload files"
                           type="file" id="uploadFiles" ref="files"
                           v-on:change="handleFilesUpload()" hidden/>
                    <div v-if="files.length !== 0" class="modal__upload-wrapper">
                        <div class="modal__upload-list" style="display: flex">
                            <div class="modal__upload-list--item" v-for="(file, i) in files">
                                <span class="remove" @click='removeFile(file, i)'>
                                    <i class="el-icon-circle-close"></i>
                                </span>
                                <app-file :url="`/projects/${projectId}/hotfixes/${currentHotfix._id}/attached/${file._id}`"
                                          :file="file"
                                          :width="100"
                                          :height="100">
                                </app-file>
                            </div>
                            <div class="modal__upload-list--btn-add" @click="chooseFiles()">
                                +
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item class="issue__content__control">
                    <el-button @click="close">Cancel</el-button>
                    <el-button type="primary" @click="updateHotfix">Update</el-button>
                    <el-button type="danger" @click="deleteHotfix" v-if="canDeleteHotfixes">Delete</el-button>
                </el-form-item>
            </el-form>
        </div>
    </el-dialog>
</template>

<script>
    import AppFile from "../AppFile";

    export default {
        name: "more-hotfix-modal",
        props: {
            data: {
                type: Object
            },
            projectId: {
                type: String
            }
        },
        components: {
            AppFile
        },
        data() {
            return {
                // issueModalVisible: true,
                modalLoading: false,
                currentHotfix: {},
                files: [],
                states: [{
                    value: 1,
                    label: 'New'
                }, {
                    value: 2,
                    label: 'In Progress'
                }, {
                    value: 3,
                    label: 'Done'
                }, {
                    value: 4,
                    label: 'Declined'
                }],
                state: '',
                priorities: [{
                    value: '1',
                    label: 'Low'
                }, {
                    value: '2',
                    label: 'Medium'
                }, {
                    value: '3',
                    label: 'High'
                }, {
                    value: '4',
                    label: 'Urgent'
                }],
                priority: '',
            }
        },
        created() {
            this.currentHotfix = { ...this.data };
            this.files = this.data.files;
            this.files.forEach(file => {
                if(file.name === undefined)
                    file.name = file.filename;
            });
            this.priority = `${this.currentHotfix.priority}`;
            this.state = this.currentHotfix.state;
        },
        mounted() {
        },
        computed: {
            canEditHotfixes: function () {
                return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.editHotfixes;
            },
            canDeleteHotfixes: function () {
                return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.deleteHotfixes;
            },
            availableTransitions: function () {
                if (this.$store.state.user.isAdmin) {
                    return this.columnList
                } else {
                    let allowedCols = this.$store.state.currentProject.role.issueTransitionMatrix[this.currentColumnId];
                    return this.columnList.filter(col =>  allowedCols.includes(col.id));
                }
            }
        },
        methods: {
            deleteHotfix: async function () {
                await this.$confirm('This will permanently delete this hotfix. Continue?', 'Warning', {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    type: "warning"
                });
                this.modalLoading = true;
                await this.$http.delete(`/projects/${this.projectId}/hotfixes/${this.currentHotfix._id}`);
                this.modalLoading = false;
                this.close('DELETE');
            },
            moveHotfix: function () {

            },
            updateHotfix: async function () {
                let data = {
                    title: this.currentHotfix.title,
                    description: this.currentHotfix.description,
                    state: this.state,
                    priority: this.priority
                };
                try {
                    await this.$http.patch(`/projects/${this.projectId}/hotfixes/${this.currentHotfix._id}`, data);
                    this.data.title = data.title;
                    this.data.description = data.description;
                    this.data.state = data.state;
                    this.data.priority = Number.parseInt(data.priority);
                } catch (error) {
                    console.log(error);
                }
            },
            close: function (param) {
                if(param === undefined || param === null)
                    this.$emit('close');
                else
                    this.$emit('close', param);
            },
            chooseFiles: function () {
                document.getElementById("uploadFiles").click()
            },
            async handleFilesUpload() {
                let files = this.$refs.files.files;
                if(this.files.length >= 3) {
                    this.$notify({
                        title: 'Error',
                        message: 'Too many files',
                        duration: 3000,
                        type: 'error'
                    });
                    return;
                }
                let formData = new FormData();
                formData.append('files', files[0]);
                let response = await this.$http.post(`/projects/${this.projectId}/hotfixes/${this.currentHotfix._id}/attach`, formData);
                this.data.files[this.currentHotfix.files.length - 1]._id = response.data[0];
                this.files.push({
                    _id: response.data[0],
                    name: files[0].name,
                    filename: files[0].filename
                })
            },
            removeFile: async function (file, i) {
                if (i > -1) {
                    await this.$http.delete(`/projects/${this.projectId}/hotfixes/${this.currentHotfix._id}/detach/${this.files[i]._id}`);
                    this.files.splice(i, 1);
                }
            },
        }
    }
</script>

<style scoped lang="scss">

</style>