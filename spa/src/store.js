//Initialize store
import Vue from 'vue';
import Vuex from "vuex";
import router from "./router";
import axios from 'axios';
import io from 'socket.io-client';
Vue.use(Vuex);

let loggedIn, socket;
let jwt = localStorage.getItem('jwt');
let isAdmin = (localStorage.getItem('isAdmin') === "true");
let username = localStorage.getItem('username');
if (username && isAdmin !== undefined && jwt) {
	loggedIn = true;
	socket = io(`${process.env.VUE_APP_BACKEND_HOST}/boardEvents`, {
		transportOptions: {
			polling: {
				extraHeaders: {
					'X-Client': `Bearer ${jwt}`
				}
			}
		}
	});
} else {
	loggedIn = false;
	isAdmin = false;
	username = '';
	jwt = '';
	socket = {};
}
const store = new Vuex.Store({
	state: {
		user: {
			loggedIn,
			jwt,
			isAdmin,
			username
		},
		currentProject: {},
		socket,
		allowedFiles: []
	}, mutations: {
		logIn(state, {jwt, username, isAdmin}) {
			localStorage.setItem('jwt', jwt);
			localStorage.setItem('username', username);
			localStorage.setItem('isAdmin', isAdmin);
			state.user.loggedIn = true;
			state.user.jwt = jwt;
			state.user.isAdmin = isAdmin;
			state.user.username = username;
			state.socket = io(`${process.env.VUE_APP_BACKEND_HOST}/boardEvents`, {
				transportOptions: {
					polling: {
						extraHeaders: {
							'X-Client': `Bearer ${jwt}`
						}
					}
				}
			});
		},
		logOut(state) {
			localStorage.removeItem('jwt');
			localStorage.removeItem('username');
			localStorage.removeItem('isAdmin');
			state.user.jwt = '';
			state.user.isAdmin = false;
			state.user.username = '';
			try {
				state.socket.disconnect();
				state.socket = {};
			} catch (e) {
				console.log('No socket to close')
			}
		},
		setCurrentProject(state, {_id}) {
			Vue.set(state.currentProject, '_id', _id);
		},
		unsetCurrentProject(state) {
			state.currentProject = {};
		},
		syncCurrentProjectRole(state, {isManager, isEditor, isCreator, isDestroyer, createHotfixes, editHotfixes, deleteHotfixes, issueTransitionMatrix}) {
			state.currentProject.role = {
				isManager,
				isEditor,
				isCreator,
				isDestroyer,
				createHotfixes,
				editHotfixes,
				deleteHotfixes,
				issueTransitionMatrix
			}
		},
		syncCurrentProjectBoard(state, columns) {
			Vue.set(state.currentProject, 'columns', columns);
		},
		syncCurrentProjectMeta(state, name) {
			Vue.set(state.currentProject, 'name', name);
		},
		addIssue(state, issueId) {
			let startingColIndex = state.currentProject.columns.findIndex(col => col.isStarting && !col.issues.includes(issueId));
			if (startingColIndex !== -1) {
					state.currentProject.columns[startingColIndex].issues.push(issueId);
			}
		},
		removeIssue(state, issueId) {
			for (let i = 0; i < state.currentProject.columns.length; i++) {
				state.currentProject.columns[i].issues = state.currentProject.columns[i].issues.filter(issue => issue !== issueId);
			}
		},
		moveIssue(state, moveOperation) {
			let targetColIndex = state.currentProject.columns.findIndex(col => col.id === moveOperation.targetColumn);
			let originalColIndex = state.currentProject.columns.findIndex(col => col.id === moveOperation.originalColumn);
			if (targetColIndex !== -1 && originalColIndex !== -1 && !(state.currentProject.columns[targetColIndex].issues.includes(moveOperation.issueId)) && state.currentProject.columns[originalColIndex].issues.includes(moveOperation.issueId)) {
				state.currentProject.columns[originalColIndex].issues = state.currentProject.columns[originalColIndex].issues.filter(i => i !== moveOperation.issueId);
				state.currentProject.columns[targetColIndex].issues.splice(moveOperation.targetPosition, 0, moveOperation.issueId);
			}
		},
		setAllowedFiles(state, data) {
			state.allowedFiles = data;
		}
	}, actions: {
		logOut({commit}) {
			commit('logOut');
			router.push('/login');
		},
		async syncCurrentProjectRole({commit, state}) {
			if(!state.user.isAdmin) {
				try {
					let role = await axios.get(`/projects/${state.currentProject._id}/roles/me`);
					commit('syncCurrentProjectRole', role.data);
				} catch (e) {
					console.log(e)
				}
			}
		},
		async syncCurrentProjectBoard({commit, state}) {
			let getColumns = await axios.get(`/projects/${state.currentProject._id}/columns`);
			commit('syncCurrentProjectBoard', getColumns.data.columns);
		},
		async syncCurrentProjectMeta({commit, state}) {
			let getMeta = await axios.get(`/projects/${state.currentProject._id}/meta`);
			commit('syncCurrentProjectMeta', getMeta.data.name);
		}
 	}
});

export default store;