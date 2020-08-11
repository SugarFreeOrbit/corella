<template>
    <el-dialog :visible="true" :before-close="close" :title="`Hotfix #${currentHotfix.hotfixCode}`">
        <div v-if="!canEditHotfixes" class="issue__content" v-loading="modalLoading">
            <p class="issue__content__title">{{currentHotfix.title}}</p>
            <hr>
            <p class="issue__content_description">{{currentHotfix.description}}</p>
            <div class="issue__content_images">
                <app-file v-for="file in files"
                          :url="`/projects/${projectId}/hotfixes/${currentHotfix._id}/attached/${file._id}`"
                          :file="file"
                          :width="100"
                          :height="100">
                </app-file>
            </div>
            <div class="issue__content__control">
                <el-button type="danger" @click="deleteHotfix" v-if="canDeleteHotfixes">Delete</el-button>
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
                    <file-upload :link="`/projects/${projectId}/hotfixes/${currentHotfix._id}/attached/`"
                                 :files="files"
                                 :attachLink="`/projects/${this.projectId}/hotfixes/${this.currentHotfix._id}/attach`"
                                 :detachLink="`/projects/${this.projectId}/hotfixes/${this.currentHotfix._id}/detach/`">
                    </file-upload>
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
    import FileUpload from "../FileUpload";

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
            AppFile,
            FileUpload
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
                    value: 1,
                    label: 'Low'
                }, {
                    value: 2,
                    label: 'Medium'
                }, {
                    value: 3,
                    label: 'High'
                }, {
                    value: 4,
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
            this.priority = this.currentHotfix.priority;
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
                    this.data.priority = data.priority;
                    if(this.state === 4)
                      this.close('DELETE');
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

        }
    }
</script>

<style scoped lang="scss">

</style>