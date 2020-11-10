<template>
  <div class="roles" v-loading="loading">
    <div class="roles__control">
      <el-button icon="el-icon-plus" type="primary" @click="addRoleModal.visible = true">Add new role</el-button>
    </div>
    <el-card class="roles__role" v-for="role in roles" v-bind:key="role.name">
      <div class="roles__role__name" slot="header">
        {{ role.name }}
      </div>
      <div class="roles__role__controls">
        <el-tooltip placement="bottom" content="View members">
          <el-button class="default__control-btn" circle type="primary" icon="el-icon-user"
                     @click="viewMembers(role.name)">
          </el-button>
        </el-tooltip>
        <el-tooltip placement="bottom" content="Edit role">
          <el-button class="default__control-btn" circle type="primary" icon="el-icon-edit"
                     @click="showEditModal(role.name)">
          </el-button>
        </el-tooltip>
        <el-tooltip placement="bottom" content="Delete role and it's members">
          <el-button class="default__control-btn" circle type="danger" icon="el-icon-delete"
                     @click="deleteRole(role.name)">
          </el-button>
        </el-tooltip>
      </div>
    </el-card>
    <el-dialog class="roles__modal_add" :visible.sync="addRoleModal.visible">
      <div v-loading="addRoleModal.loading">
        <el-form>
          <el-form-item label="Role name">
            <el-input autocomplete="off" v-model="addRoleModal.name"></el-input>
          </el-form-item>
          <el-form-item>
            <div class="switch-group">
              <div class="switch-group__group">
                <label>General</label>
                <div class="switch-group__item">
                  <label>Manage</label>
                  <el-switch v-model="addRoleModal.isManager"></el-switch>
                </div>
              </div>
              <div class="switch-group__group">
                <label>Issue</label>
                <div class="switch-group__item">
                  <label>Create</label>
                  <el-switch v-model="addRoleModal.isCreator"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Edit</label>
                  <el-switch v-model="addRoleModal.isEditor"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Delete</label>
                  <el-switch v-model="addRoleModal.isDestroyer"></el-switch>
                </div>
              </div>
              <div class="switch-group__group">
                <label>Hotfix</label>
                <div class="switch-group__item">
                  <label>Create</label>
                  <el-switch v-model="addRoleModal.createHotfixes"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Edit</label>
                  <el-switch v-model="addRoleModal.editHotfixes"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Delete</label>
                  <el-switch v-model="addRoleModal.deleteHotfixes"></el-switch>
                </div>
              </div>
              <div class="switch-group__group">
                <label>Version</label>
                <div class="switch-group__item">
                  <label>View</label>
                  <el-switch v-model="addRoleModal.viewVersion"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Edit</label>
                  <el-switch v-model="addRoleModal.editVersion"></el-switch>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-for="startingColumn in columns" v-bind:key="startingColumn.id">
            {{ startingColumn.name }} <i class="el-icon-right"></i> {{ " " }}
            <el-select v-model="addRoleModal.issueTransitionMatrix[startingColumn.id]" multiple
                       placeholder="Select transitions">
              <el-option v-for="targetColumn in columns" :label="targetColumn.name" :key="targetColumn.id"
                         :value="targetColumn.id"
                         v-if="startingColumn.id !== targetColumn.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="text-align: center">
            <el-button @click="addRoleModal.visible = false">Cancel</el-button>
            <el-button type="primary" @click="addRole">Create</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog class="roles__modal_viewMembers" v-if="viewMembersModal.ready"
               :visible.sync="viewMembersModal.visible" :title="viewMembersModal.targetRole">
      <div v-loading="viewMembersModal.loading">
        <div class="roles__modal_viewMembers__search">
          <el-select multiple filterable v-model="viewMembersModal.newMembers"
                     style="margin-right: 10px; width: 500px;">
            <el-option v-for="user in users" v-bind:key="user._id" :label="user.username" :value="user._id"
                       v-if="!userHasRole(user._id)">
            </el-option>
          </el-select>
          <el-button type="primary" @click="addMembers">Add new members</el-button>
          <el-table :data="members" border class="roles__modal_viewMembers__list">
            <el-table-column prop="username" label="Username"></el-table-column>
            <el-table-column label="Actions" width="72px">
              <template slot-scope="props">
                <el-button type="danger" icon="el-icon-delete" circle
                           @click="removeMember(viewMembersModal.targetRole, props.row._id)">
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="roles__modal_edit" :visible.sync="editRoleModal.visible" v-if="editRoleModal.ready">
      <div v-loading="editRoleModal.loading">
        <el-form>
          <el-form-item label="Role name">
            <el-input autocomplete="off" v-model="editRoleModal.name"></el-input>
          </el-form-item>
          <el-form-item>
            <div class="switch-group">
              <div class="switch-group__group">
                <label>General</label>
                <div class="switch-group__item">
                  <label>Manage</label>
                  <el-switch v-model="editRoleModal.isManager"></el-switch>
                </div>
              </div>
              <div class="switch-group__group">
                <label>Issue</label>
                <div class="switch-group__item">
                  <label>Create</label>
                  <el-switch v-model="editRoleModal.isCreator"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Edit</label>
                  <el-switch v-model="editRoleModal.isEditor"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Delete</label>
                  <el-switch v-model="editRoleModal.isDestroyer"></el-switch>
                </div>
              </div>
              <div class="switch-group__group">
                <label>Hotfix</label>
                <div class="switch-group__item">
                  <label>Create</label>
                  <el-switch v-model="editRoleModal.createHotfixes"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Edit</label>
                  <el-switch v-model="editRoleModal.editHotfixes"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Delete</label>
                  <el-switch v-model="editRoleModal.deleteHotfixes"></el-switch>
                </div>
              </div>
              <div class="switch-group__group">
                <label>Version</label>
                <div class="switch-group__item">
                  <label>View</label>
                  <el-switch v-model="editRoleModal.viewVersion"></el-switch>
                </div>
                <div class="switch-group__item">
                  <label>Edit</label>
                  <el-switch v-model="editRoleModal.editVersion"></el-switch>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-for="startingColumn in columns" v-bind:key="startingColumn.id">
            {{ startingColumn.name }} <i class="el-icon-right"></i> {{ " " }}
            <el-select v-model="editRoleModal.issueTransitionMatrix[startingColumn.id]" multiple
                       placeholder="Select transitions">
              <el-option v-for="targetColumn in columns" :label="targetColumn.name" :key="targetColumn.id"
                         :value="targetColumn.id"
                         v-if="startingColumn.id !== targetColumn.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="text-align: center">
            <el-button @click="editRoleModal.visible = false">Cancel</el-button>
            <el-button type="primary" @click="editRole">Update</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "RolesAndMembers",
  data() {
    return {
      roles: [],
      loading: false,
      addRoleModal: {
        visible: false,
        loading: false,
        name: '',
        isManager: false,
        isCreator: false,
        isDestroyer: false,
        isEditor: false,
        createHotfixes: false,
        editHotfixes: false,
        deleteHotfixes: false,
        viewVersion: false,
        editVersion: false,
        issueTransitionMatrix: {}
      },
      users: [],
      viewMembersModal: {
        ready: false,
        targetRole: '',
        visible: false,
        newMembers: [],
        loading: false
      },
      editRoleModal: {
        roleIndex: 0,
        visible: false,
        ready: false,
        loading: false,
        name: '',
        isManager: false,
        isCreator: false,
        isDestroyer: false,
        isEditor: false,
        createHotfixes: false,
        editHotfixes: false,
        deleteHotfixes: false,
        viewVersion: false,
        editVersion: false,
        issueTransitionMatrix: {}
      },
      columns: []
    }
  },
  computed: {
    projectId: function () {
      return this.$store.state.currentProject._id;
    },
    members: function () {
      let role = this.roles.find(r => r.name === this.viewMembersModal.targetRole);
      if (role) {
        return this.users.filter(user => role.members.includes(user._id));
      } else {
        return null;
      }
    }
  },
  async created() {
    this.loading = true;
    let getRoles = await this.$http.get(`/projects/${this.projectId}/roles`);
    this.roles = getRoles.data.roles;
    if (this.$store.state.currentProject.columns === undefined) {
      try {
        await this.$store.dispatch('syncCurrentProjectBoard');
        this.loading = false;
      } catch (e) {
        this.loading = false;
        console.log(e);
      }
    }
    this.columns = this.$store.state.currentProject.columns.map(col => {
      return {
        id: col.id,
        name: col.name,
        isStarting: col.isStarting,
        isClosing: col.isClosing
      };
    });
    this.loading = false;
    let getUsers = await this.$http.get(`/users`);
    this.users = getUsers.data.data;
    this.viewMembersModal.ready = true;
  },
  methods: {
    addRole: async function () {
      let revert = this.roles;
      try {
        this.addRoleModal.loading = true;
        if (this.roles.find(role => this.addRoleModal.name === role.name)) {
          this.addRoleModal.loading = false;
          this.$notify({
            type: "error",
            duration: 2000,
            title: "Role names must be unique"
          });
        } else {
          let payload = {
            name: this.addRoleModal.name,
            isManager: this.addRoleModal.isManager,
            isCreator: this.addRoleModal.isCreator,
            isDestroyer: this.addRoleModal.isDestroyer,
            isEditor: this.addRoleModal.isEditor,
            createHotfixes: this.addRoleModal.createHotfixes,
            editHotfixes: this.addRoleModal.editHotfixes,
            deleteHotfixes: this.addRoleModal.deleteHotfixes,
            editVersion: this.addRoleModal.editVersion,
            viewVersion: this.addRoleModal.viewVersion,
            issueTransitionMatrix: this.addRoleModal.issueTransitionMatrix,
            members: []
          };
          this.roles.push(payload);
          await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
          this.addRoleModal.loading = false;
          this.addRoleModal.visible = false;
        }
      } catch (e) {
        this.roles = revert;
        this.addRoleModal.loading = false;
        this.$notify({
          type: "error",
          duration: "2000",
          message: "Failed to add a new role!"
        });
        console.log(e);
      }
    },
    deleteRole: async function (name) {
      await this.$confirm("This will permanently delete this role and all of it's members. Continue?", 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: "warning"
      });
      let revert = this.roles;
      try {
        this.roles = this.roles.filter(role => role.name !== name);
        await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
      } catch (e) {
        this.roles = revert;
        console.log(e);
      }
    },
    userHasRole: function (userId) {
      return !!this.roles.find(role => role.members.includes(userId));
    },
    viewMembers: function (roleName) {
      this.viewMembersModal.targetRole = roleName;
      this.viewMembersModal.visible = true;
    },
    addMembers: async function () {
      if (this.viewMembersModal.newMembers.length === 0) {
        this.$notify({
          type: "warning",
          duration: 2000,
          title: "No members to add!"
        })
      } else {
        this.viewMembersModal.loading = true;
        let revert = this.roles;
        let roleIndex = this.roles.findIndex(role => role.name === this.viewMembersModal.targetRole);
        this.roles[roleIndex].members.push(...this.viewMembersModal.newMembers);
        try {
          await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
          this.viewMembersModal.newMembers = [];
          this.viewMembersModal.loading = false;
        } catch (e) {
          this.roles = revert;
          this.viewMembersModal.loading = false;
          console.log(e);
        }
      }
    },
    removeMember: async function (roleName, userId) {
      this.viewMembersModal.loading = true;
      let revert = this.roles;
      let roleIndex = this.roles.findIndex(role => role.name === roleName);
      let memberIndex = this.roles[roleIndex].members.findIndex(member => member === userId);
      this.roles[roleIndex].members.splice(memberIndex, 1);
      try {
        await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
        this.viewMembersModal.newMembers = [];
        this.viewMembersModal.loading = false;
      } catch (e) {
        this.roles = revert;
        this.viewMembersModal.loading = false;
        console.log(e);
      }
    },
    showEditModal: function (roleName) {
      let roleIndex = this.roles.findIndex(r => r.name === roleName);
      this.editRoleModal.issueTransitionMatrix = this.roles[roleIndex].issueTransitionMatrix;
      this.editRoleModal.name = this.roles[roleIndex].name;
      this.editRoleModal.isCreator = this.roles[roleIndex].isCreator;
      this.editRoleModal.isDestroyer = this.roles[roleIndex].isDestroyer;
      this.editRoleModal.isEditor = this.roles[roleIndex].isEditor;
      this.editRoleModal.isManager = this.roles[roleIndex].isManager;
      this.editRoleModal.createHotfixes = this.roles[roleIndex].createHotfixes;
      this.editRoleModal.editHotfixes = this.roles[roleIndex].editHotfixes;
      this.editRoleModal.deleteHotfixes = this.roles[roleIndex].deleteHotfixes;
      this.editRoleModal.editVersion = this.roles[roleIndex].editVersion;
      this.editRoleModal.viewVersion = this.roles[roleIndex].viewVersion;
      this.editRoleModal.roleIndex = roleIndex;
      this.editRoleModal.ready = true;
      this.editRoleModal.visible = true;
    },
    editRole: async function () {
      let revert = this.roles;
      this.editRoleModal.loading = true;
      try {
        this.roles[this.editRoleModal.roleIndex].name = this.editRoleModal.name;
        this.roles[this.editRoleModal.roleIndex].isCreator = this.editRoleModal.isCreator;
        this.roles[this.editRoleModal.roleIndex].isDestroyer = this.editRoleModal.isDestroyer;
        this.roles[this.editRoleModal.roleIndex].isEditor = this.editRoleModal.isEditor;
        this.roles[this.editRoleModal.roleIndex].isManager = this.editRoleModal.isManager;
        this.roles[this.editRoleModal.roleIndex].createHotfixes = this.editRoleModal.createHotfixes;
        this.roles[this.editRoleModal.roleIndex].editHotfixes = this.editRoleModal.editHotfixes;
        this.roles[this.editRoleModal.roleIndex].deleteHotfixes = this.editRoleModal.deleteHotfixes;
        this.roles[this.editRoleModal.roleIndex].editVersion = this.editRoleModal.editVersion;
        this.roles[this.editRoleModal.roleIndex].viewVersion = this.editRoleModal.viewVersion;
        this.roles[this.editRoleModal.roleIndex].issueTransitionMatrix = this.editRoleModal.issueTransitionMatrix;

        await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
        this.editRoleModal.loading = false;
        this.editRoleModal.visible = false;
      } catch (e) {
        this.roles = revert;
        this.editRoleModal.loading = false;
        this.$notify({
          type: "error",
          duration: "2000",
          message: "Failed to edit role!"
        });
        console.log(e);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.roles {
  width: calc(100vw - 80px);
  height: calc(100vh - 52px);
  padding-right: 55px;
  margin-left: auto;
  overflow-y: scroll;

  &__modal {
    &_viewMembers {
      &__search {
      }

      &__list {
        margin-top: 20px;
      }
    }
  }

  &__control {
    text-align: center;
    margin-top: 25px;
  }

  &__role {
    width: 350px;
    display: inline-block;
    margin: 30px;

    &__name {
      font-weight: bold;

      &:hover {
        color: #a9c737;
        cursor: pointer;
      }
    }
  }
}

.switch-group {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
  justify-content: center;

  &__group {
    width: 25%;

    > label {
      display: block;
      font-weight: 700;
      font-size: 18px;
    }

  }

  &__item {
    width: 100%;

    > label {
      display: block;
      margin: 0;
      //margin-right: 20px;
      font-weight: 600;
      line-height: 30px;
    }

  }

}
</style>