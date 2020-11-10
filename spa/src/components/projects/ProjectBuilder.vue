<template>
  <div class="projectBuilder">
    <div class="projectBuilder__close" @click="goBack"><i class="el-icon-close"></i>
    </div>
    <div class="projectBuilder__content container">
      <el-steps :active="projectBuilder.step" align-center finish-status="success">
        <el-step title="Name your project"></el-step>
        <el-step title="Add columns"></el-step>
        <el-step title="Add roles"></el-step>
      </el-steps>
      <el-form :model="projectBuilder.naming" class="projectBuilder__content__naming container"
               v-if="projectBuilder.step === 0">
        <el-form-item label="Project name">
          <el-input v-model="projectBuilder.naming.name"></el-input>
        </el-form-item>
        <el-form-item label="Project description">
          <el-input v-model="projectBuilder.naming.description"></el-input>
        </el-form-item>
      </el-form>
      <div class="projectBuilder__content__columns" v-if="projectBuilder.step === 1">
        <el-card class="projectBuilder__content__columns__column" v-for="column in projectBuilder.columns"
                 v-bind:key="column.name">
          <div slot="header">
            <div class="projectBuilder__content__columns__column__remove"
                 @click="removeColumn(column.name)"><i class="el-icon-close"></i></div>
            <div class="projectBuilder__content__columns__column__header" slot="header">
              <p>{{ column.name }}</p>
              <p v-if="column.limit">WIP limit: {{ column.limit }}</p>
            </div>
          </div>
        </el-card>
        <el-card class="projectBuilder__content__columns__add" v-if="projectBuilder.columns.length <= 6">
          <div slot="header">
            Add new column
          </div>
          <el-form :model="projectBuilder.newColumn">
            <el-form-item label="Column name" required>
              <el-input v-model="projectBuilder.newColumn.name" maxlength="15"></el-input>
            </el-form-item>
            <el-form-item label="WIP limit:">
              <el-input-number v-model="projectBuilder.newColumn.limit" :min="0"
                               size="mini"></el-input-number>
            </el-form-item>
            <el-form-item style="text-align: center">
              <el-button circle icon="el-icon-plus" type="primary" @click="addColumn"></el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div class="projectBuilder__content__roles" v-if="projectBuilder.step === 2">
        <el-card v-for="role in projectBuilder.roles" style="margin-right: 10px" v-bind:key="role.name">
          <div class="projectBuilder__content__roles__remove" @click="removeRole(role.name)"><i
              class="el-icon-close"></i></div>
          {{ role.name }}
        </el-card>
        <el-button round icon="el-icon-plus" type="primary"
                   class="projectBuilder__content__roles__addButton"
                   @click="projectBuilder.visibleModal = true">Add new role
        </el-button>
        <add-new-role-modal
            v-if="projectBuilder.visibleModal"
            :project-builder="projectBuilder"
            @close="projectBuilder.visibleModal = false">
        </add-new-role-modal>
      </div>
      <div class="projectBuilder__content__control">
        <el-button @click="projectBuilder.step--" v-if="projectBuilder.step > 0">Previous</el-button>
        <el-button @click="progressBuilder" type="primary" v-if="projectBuilder.step < 2">Next</el-button>
        <el-button @click="createProject" type="primary" v-if="projectBuilder.step === 2"
                   v-loading="projectBuilder.creationInProgress">Submit
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import md5 from "md5";
import AddNewRoleModal from "./modals/AddNewRoleModal";

export default {
  name: "project-builder",
  components: {AddNewRoleModal},
  data() {
    return {
      projectBuilder: {
        creationInProgress: false,
        step: 0,
        naming: {
          name: '',
          description: ''
        },
        columns: [],
        newColumn: {
          name: '',
          limit: 0
        },
        roles: [],
        visibleModal: false
      }
    }
  },
  methods: {
    goBack() {
      this.$router.replace('/')
    },
    progressBuilder: function () {
      switch (this.projectBuilder.step) {
        case 0:
          if (this.projectBuilder.naming.name.length > 0) {
            this.projectBuilder.step++;
          } else {
            this.$notify({
              type: "error",
              title: "Validation error",
              message: "Projects must have a name"
            });
          }
          break;
        case 1:
          let schemaValid = this.$schemaValidators.validateColumns(this.projectBuilder.columns);
          if (schemaValid) {
            this.projectBuilder.step++;
          } else {
            this.$notify({
              type: "error",
              title: "Validation error",
              message: "Invalid columns"
            });
          }
          break;
        case 2:
          this.projectBuilder.newRole.itm = {};
          this.projectBuilder.columns.forEach(col => {
            this.projectBuilder.newRole.itm[col.name] = [];
          });
          break;
      }
    },
    addColumn: function () {
      if (this.projectBuilder.columns.find(col => col.name === this.projectBuilder.newColumn.name)
          || this.projectBuilder.newColumn.name.length === 0) {
        this.$notify({
          title: 'Validation error',
          message: 'Column names must be unique',
          type: 'error'
        });
      } else {
        if (this.projectBuilder.newColumn.limit <= 0) {
          this.projectBuilder.columns.push({
            name: this.projectBuilder.newColumn.name
          })
        } else {
          this.projectBuilder.columns.push({
            name: this.projectBuilder.newColumn.name,
            limit: this.projectBuilder.newColumn.limit
          })
        }
        this.projectBuilder.newColumn.name = '';
        this.projectBuilder.newColumn.limit = 0;
      }
    },
    removeColumn: function (name) {
      let index = this.projectBuilder.columns.findIndex(col => col.name === name);
      this.projectBuilder.columns.splice(index, 1);
    },
    removeRole: function (name) {
      let ind = this.projectBuilder.roles.findIndex((role) => role.name === name);
      this.projectBuilder.roles.splice(ind, 1);
    },
    createProject: async function () {
      this.projectBuilder.creationInProgress = true;
      //console.log(this.$schemaValidators.validateRoles.errors);
      if (this.$schemaValidators.validateRoles(this.projectBuilder.roles)) {
        //Sanitizing ITMs
        let sanitizedRoles = [];
        let sanitizedItm = {};
        for (let role of this.projectBuilder.roles) {
          sanitizedItm = {};
          for (let key in role.issueTransitionMatrix) {
            let sanitizedKey = md5(this.projectBuilder.naming.name + key);
            sanitizedItm[sanitizedKey] = [];
            for (let columnName of role.issueTransitionMatrix[key]) {
              sanitizedItm[sanitizedKey].push(md5(this.projectBuilder.naming.name + columnName));
            }
          }
          sanitizedRoles.push({
            name: role.name,
            isEditor: role.isEditor,
            isCreator: role.isCreator,
            isManager: role.isManager,
            isDestroyer: role.isDestroyer,
            createHotfixes: role.createHotfixes,
            editHotfixes: role.editHotfixes,
            deleteHotfixes: role.deleteHotfixes,
            viewVersion: role.viewVersion,
            editVersion: role.editVersion,
            issueTransitionMatrix: sanitizedItm
          });
        }
        try {
          await this.$http.put('/projects', {
            name: this.projectBuilder.naming.name,
            description: this.projectBuilder.naming.description,
            columns: this.projectBuilder.columns,
            roles: sanitizedRoles
          });
        } catch (e) {
          console.log(e);
          switch (e.response.status) {
            case 0:
              this.$notify({
                title: 'Network error',
                type: 'error'
              });
              break;
            case 400:
              this.$notify({
                title: 'Duplication error',
                message: "Such project already exists. Try changing the project name"
              })
          }
        } finally {
          this.$router.replace('/')
        }
      } else {
        this.$notify({
          title: 'Validation error',
          message: 'Roles are invalid',
          type: 'error'
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.projectBuilder {
  &__close {
    font-size: 25px;
    position: relative;
    top: 15px;
    left: 15px;
    cursor: pointer;
    display: inline-block;
    box-sizing: border-box;
    padding: 2px;

    &:hover {
      color: #87A330;
    }
  }

  &__content {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex-wrap: wrap;
    width: 70%;

    &__control {
      text-align: center;
      margin-top: 50px;
    }

    &__naming {
      width: 60%;
      margin-top: 100px;
    }

    &__columns {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: center;
      //height: 50vh;
      margin-top: 30px;

      &__add {
        min-height: 280px;
      }

      &__column {
        color: black;
        width: 20%;
        margin-right: 5px;

        &__remove {
          position: relative;
          display: inline-block;
          top: -10px;
          left: -10px;

          &:hover {
            cursor: pointer;
            color: #87A330;
          }
        }

        &__header {
          height: 45px;
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          //flex-wrap: wrap;
          font-weight: bold;
        }
      }
    }

    &__roles {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 40px;

      &__addButton {
        height: 40px;
      }

      &__remove {
        top: -10px;
        left: -10px;
        position: relative;
        display: inline-block;

        &:hover {
          cursor: pointer;
          color: #87A330;
        }
      }
    }
  }
}
</style>