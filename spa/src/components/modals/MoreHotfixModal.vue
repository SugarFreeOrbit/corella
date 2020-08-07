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
                <el-form-item>
                    <el-button @click="chooseFiles()" size="small" type="primary">Click to upload</el-button>
                    <input style="display: none" placeholder="upload files"
                           type="file" id="uploadFiles" ref="files"
                           multiple v-on:change="handleFilesUpload()" hidden/>
                    <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
                    <div v-if="files.length !== 0" class="modal__upload-wrapper">
                        <ul class="modal__upload-list">
                            <li v-for="(file, i) in files">
                                <p class="name">{{file.name}}
                                    <span class="remove" @click='removeFile(file, i)'><i
                                            class="el-icon-circle-close"></i></span>
                                </p>
                            </li>
                        </ul>
                    </div>
                </el-form-item>
                <el-form-item class="issue__content__control">
                    <el-button @click="close">Cancel</el-button>
                    <el-button type="primary" @click="updateHotfix">Update</el-button>
                    <el-select v-model="state" placeholder="Move this issue to..." class="issue__content__control__move" @change="moveHotfix">
                        <el-option v-for="col in states"
                                   :key="col.value"
                                   :label="col.label"
                                   :value="col.value">
                        </el-option>
                    </el-select>
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
                state: '',
            }
        },
        created() {
            this.currentHotfix = this.data;
            this.files = this.data.files;
            this.files.forEach(file => {
                if(file.name === undefined)
                    file.name = file.filename;
            });
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
                console.log('start');
                let data = {
                    title: this.currentHotfix.title,
                    description: this.currentHotfix.description,
                    state: this.currentHotfix.state,
                    priority: 1
                };
                try {
                    await this.$http.patch(`/project/${this.projectId}/hotfixes/${this.currentHotfix._id}`, data);
                    console.log('ok');
                } catch (error) {
                    console.log(error);
                }
            },
/*            deleteIssue: async function() {
                await this.$confirm('This will permanently delete this issue. Continue?', 'Warning', {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    type: "warning"
                });
                this.modalLoading = true;
                await this.$http.delete(`/projects/${this.projectId}/issues/${this.issueId}`);
                this.$store.commit('removeIssue', this.issueId);
                this.modalLoading = false;
                this.close();
            },*/
/*            updateIssue: async function() {
                this.modalLoading = true;
                await this.$http.patch(`/projects/${this.projectId}/issues/${this.issueId}`, {
                    title: this.currentIssue.title,
                    description: this.currentIssue.description,
                    assignee: this.currentIssue.assignee._id
                });
                this.modalLoading = false;
            },*/
/*            moveIssue: async function(targetColumn) {
                this.modalLoading = true;
                let payload = {
                    issueId: this.issueId,
                    targetColumn: targetColumn,
                    targetPosition: 0,
                    originalColumn: this.currentColumnId
                };
                this.$store.commit('moveIssue', payload);
                this.modalLoading = false;
                try {
                    let backendMove = await this.$http.post(`/projects/${this.projectId}/issues/move`, payload);
                } catch (e) {
                    this.$store.commit('moveIssue', {
                        issueId: payload.issueId,
                        targetColumn: payload.originalColumn,
                        targetPosition: 0,
                        originalColumn: payload.targetColumn
                    });
                }
            },*/
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
                this.currentHotfix.files.push(...files);
                let formData = new FormData();
                formData.append('files', files[files.length - 1]);
                let response = await this.$http.post(`/projects/${this.projectId}/issues/${this.issueId}/attach`, formData);
                this.currentHotfix.files[this.currentHotfix.files.length - 1]._id = response.data[0];
                this.files[this.files.length - 1]._id = response.data[0];
            },
            removeFile: async function (file, i) {
                if (i > -1) {
                    await this.$http.delete(`/projects/${this.projectId}/issues/${this.issueId}/detach/${this.files[i]._id}`);
                    this.files.splice(i, 1);
                }
            },
        }
    }
</script>

<style scoped lang="scss">

</style>