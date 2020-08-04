<template>
    <el-dialog :visible.sync="issueModalVisible">
        <div v-if="!canEditIssues" class="issue__content" v-loading="modalLoading">
            <p class="issue__content__title">{{currentIssue.title}}</p>
            <hr>
            <p class="issue__content_description">{{currentIssue.description}}</p>
            <div class="issue__content_images" v-for="file in files">
                <img id="test" src="" alt="">
<!--                <div id="test">

                </div>-->
<!--                <img :src="" alt="">-->
            </div>
            <div class="issue__content__control">
                <el-button type="danger" @click="deleteIssue" v-if="canDeleteIssues">Delete</el-button>
                <el-select v-model="targetColumn" placeholder="Move this issue to..." class="issue__content__control__move" @change="moveIssue">
                    <el-option v-for="col in availableTransitions"
                               :key="col.id"
                               :label="col.name"
                               :value="col.id">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="issue__content" v-else v-loading="modalLoading">
            <el-form>
                <el-form-item label="Title">
                    <el-input v-model="currentIssue.title"></el-input>
                </el-form-item>
                <hr>
                <el-form-item label="Description">
                    <el-input type="textarea" :rows="6" v-model="currentIssue.description"></el-input>
                </el-form-item>
<!--                <div class="issue__content_images">
                    <div style="width: 100%;height: 50px;background-color: red"></div>
                    <img :src="`http://127.0.0.1:9080/projects/${this.projectId}/issues/${this.issueId}/attachment/${currentIssue.files[0]._id}`" alt="">
                </div>-->
                <el-form-item class="issue__content__control">
                    <el-button @click="issueModalVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="updateIssue">Update</el-button>
                    <el-select v-model="targetColumn" placeholder="Move this issue to..." class="issue__content__control__move" @change="moveIssue">
                        <el-option v-for="col in availableTransitions"
                                   :key="col.id"
                                   :label="col.name"
                                   :value="col.id">
                        </el-option>
                    </el-select>
                    <el-button type="danger" @click="deleteIssue" v-if="canDeleteIssues">Delete</el-button>
                </el-form-item>
            </el-form>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        name: "more-issue-modal",
        props: {
            data: {
                type: Object
            },
            columnList: {
                type: Array
            },
            issueId: {
                type: String
            },
            currentColumnId: {
                type: String
            },
            projectId: {
                type: String
            }
        },
        data() {
            return {
                issueModalVisible: true,
                modalLoading: false,
                targetColumn: '',
                currentIssue: {},
                files: []
            }
        },
        created() {
            this.currentIssue = this.data;
            this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}/attachment/${this.currentIssue.files[0]._id}`).then(response => {

                let reader = new FileReader();
                let tmp = reader.readAsDataURL(response.data);
                console.log(tmp);
                /*let img = new Image(response.data);
                img.width = '60px';
                img.height = '60px';
                this.files.push(img);
                console.log(img);*/
                //document.getElementById('test').innerHTML = img;
                //document.getElementById('test').setAttribute('src', `data:image/gif;base64,${response.data}`);

                /*let blob = new Blob([xhr.response], {
                    type: xhr.getResponseHeader("Content-Type")
                });*/
/*                let blob = new Blob(response.data, {
                    type: 'text/plain'
                });
                var imgUrl = window.URL.createObjectURL(blob);//multipart/form-data
                console.log(imgUrl);*/
            });
/*            this.currentIssue.files.forEach(file => {
                //this.files.push(file);
                this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}/attachment/${this.currentIssue.files[0]._id}`).then(response => {
                    this.files.push(response.data);
                });
            });*/
            console.log(this.files);
        },
        computed: {
            canEditIssues: function () {
                return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isEditor;
            },
            canDeleteIssues: function () {
                return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isDestroyer;
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
            deleteIssue: async function() {
                await this.$confirm('This will permanently delete this issue. Continue?', 'Warning', {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    type: "warning"
                });
                this.modalLoading = true;
                await this.$http.delete(`/projects/${this.projectId}/issues/${this.issueId}`);
                this.$store.commit('removeIssue', this.issueId);
                this.modalLoading = false;
                this.issueModalVisible = false;
            },
            updateIssue: async function() {
                this.modalLoading = true;
                await this.$http.patch(`/projects/${this.projectId}/issues/${this.issueId}`, {
                    title: this.title,
                    description: this.description,
                    color: this.color,
                    assignee: this.assignee._id
                });
                this.modalLoading = false;
            },
            moveIssue: async function(targetColumn) {
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
            },

        }
    }
</script>

<style scoped lang="scss">
    .issue__content_images {
        display: flex;
        flex-wrap: wrap;
        > img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
    }
</style>