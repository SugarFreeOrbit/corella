<template>
	<div class="board" v-loading="loading">
		<el-card class="board__column" v-for="(column, i) in columns" v-bind:key="column.id">
			<div class="board__column__header" slot="header">
				<p>{{column.name}}</p>
			</div>
			<div class="board__column__content" :class="{ crowded: column.issues.length > column.limit }">
        <draggable :class="column.id"
                   :list="column.issues === undefined ? [] : column.issues"
                   :disabled="draggableStatus"
                   group="people"
                   style="height: calc(100vh - 212px)"
                   @add="moveIssue"
                   @update="moveIssue"
                   @choose="choose"
                   @unchoose="unchoose">
          <issue-card v-for="issueId in column.issues" v-bind:key="issueId"
                      :id="issueId"
                      v-bind:issueId="issueId"
                      v-bind:projectId="projectId"
                      v-bind:columnList="columnList"
                      v-bind:versions="versions"
                      v-bind:currentColumnId="column.id"></issue-card>
        </draggable>
			</div>
		</el-card>
	</div>
</template>

<script>
	import IssueCard from "./IssueCard";
  import draggable from 'vuedraggable';

	export default {
		name: "Board",
		components: {
		  IssueCard,
      draggable
    },
    computed: {
      draggableStatus() {
        return this.$route.query.issue !== undefined;
      },
			projectId: function () {
				return this.$store.state.currentProject._id
			},
			canCreateIssues: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isCreator;
			},
			columnList: function () {
				return this.$store.state.currentProject.columns.map(col => {
					return {
						id: col.id,
						name: col.name,
						isStarting: col.isStarting,
						isClosing: col.isClosing
					};
				});
			},
			columns: function () {
				return this.$store.state.currentProject.columns;
			}
		},
		data() {
			return {
				loading: false,
				issueCreationModal: {
					active: false,
					title: '',
					description: '',
					inProgress: false
				},
        versions: [],
				boardSocket: {},
        saveColumns: null
			}
		},
    mounted() {
		  this.getVersions()
    },
    async created() {
			this.loading = true;
			this.boardSocket = this.$store.state.socket;
			this.boardSocket.on('newIssue', (message) => {
				if (message.projectId === this.projectId) {
					this.$store.commit('addIssue', message.issueId)
				}
			});
			this.boardSocket.on('deletedIssue', (message) => {
				if (message.projectId === this.projectId) {
					this.$store.commit('removeIssue', message.issueId)
				}
			});
			this.boardSocket.on('movedIssue', message => {
				if (message.projectId === this.projectId) {
					this.$store.commit('moveIssue', message.moveOperation)
				}
			});
			try {
				await this.$store.dispatch('syncCurrentProjectBoard');
				this.loading = false;
			} catch (e) {
				this.loading = false;
				console.log(e);
			}
		},
    methods: {
      unchoose: function () {
        if (!this.$store.state.user.isAdmin) {
          let tmp = { ...this.$store.state.currentProject.role.issueTransitionMatrix };
          if(tmp === undefined || tmp === null)
            return;
          for(let key in tmp) {
            let column = document.getElementsByClassName(key)[0];
            column.classList.remove('no-drop');
          }
        }
      },
      async getVersions() {
        try {
          const response = await this.$http.get(`/projects/${this.projectId}/versions`)
          response.data.forEach(item => this.versions.push(item))
        } catch (e) {
          console.log(e)
        }
      },
		  choose: function (par) {
        this.saveColumns = JSON.stringify(this.columns);
		    let id = par.target.className;
        if (!this.$store.state.user.isAdmin) {
          let tmp = { ...this.$store.state.currentProject.role.issueTransitionMatrix };
          if(tmp === undefined || tmp === null)
            return;
          delete tmp[id];
          let allowedCols = this.$store.state.currentProject.role.issueTransitionMatrix[id];
          allowedCols.forEach(item => {
            delete tmp[item];
          });
          for(let key in tmp) {
            let column = document.getElementsByClassName(key)[0];
            column.classList.add('no-drop');
          }
        }
      },
      moveIssue: async function (param) {
        let fromId = param.from.classList[0];
        let toId = param.to.classList[0];

        if (!this.$store.state.user.isAdmin) {
          let allowedCols = this.$store.state.currentProject.role.issueTransitionMatrix[fromId];
          let err = true;
          allowedCols.forEach(item => {
            if(item === toId) {
              err = false;
            }
          });
          if(err) {
            this.$store.commit('syncCurrentProjectBoard', JSON.parse(this.saveColumns));
            return;
          }
        }

        let issueId = param.item.id;
        let payload = {
          issueId: issueId,
          targetColumn: toId,
          targetPosition: param.newIndex,
          originalColumn: fromId
        };
        try {
          let backendMove = await this.$http.post(`/projects/${this.projectId}/issues/move`, payload);
        } catch (e) {
          this.loading = true;
          await this.$store.dispatch('syncCurrentProjectBoard');
          this.loading = false;
        }
      },
    }
	}
</script>

<style scoped lang="scss">
	.board {
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
		align-content: stretch;
		height: calc(100% - 60px);
		padding-top: 5px;
		&__column {
			width: 300px;
			margin-left: 10px;
			height: 100%;
			&__header {
				color: black;
				font-weight: bold;
				height: 40px;
				text-align: center;
				vertical-align: middle;
			}
			&__content {
				height: calc(100vh - 144px);
				overflow-y: auto;
        //padding: 20px;
        padding: 0;
        box-sizing: border-box;
			}
		}

    .crowded {
      background-color: rgba(255, 204, 204, 0.5);
    }

    .no-drop {
      position: relative;
      background-color: #e2e2e2;
      height: 100% !important;
      overflow: hidden;

      &:before {
        content: '';
        position: absolute;
        background: url(/images/icon-lock.png);
        background-size: 100% 100%;
        width: 30px;
        height: 34px;
        left: calc(50% - 15px);
        bottom: 15px;
      }

    }

	}
</style>

<style>
  .board__column > .el-card__body {
    padding: 0!important;
  }
</style>