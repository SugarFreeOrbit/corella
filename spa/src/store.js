//Initialize store
import Vue from 'vue';
import Vuex from "vuex";
import router from "./router";
import axios from 'axios';
import io from 'socket.io-client';
Vue.use(Vuex);

let loggedIn;
let jwt = localStorage.getItem('jwt');
let isAdmin = (localStorage.getItem('isAdmin') === "true");
let username = localStorage.getItem('username');
if (username && isAdmin !== undefined && jwt) {
	loggedIn = true;
} else {
	loggedIn = false;
	isAdmin = false;
	username = '';
	jwt = '';
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
		socket: {}
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
							'Hi': 'Mark'
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
			state.currentProject._id = _id;
		},
		unsetCurrentProject(state) {
			state.currentProject = {};
		},
		syncCurrentProjectRole(state, {isManager, isEditor, isCreator, isDestroyer, issueTransitionMatrix}) {
			state.currentProject.role = {
				isManager,
				isEditor,
				isCreator,
				isDestroyer,
				issueTransitionMatrix
			}
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
					commit('syncCurrentProjectRole', role.data)
				} catch (e) {
					console.log(e)
				}
			}
		}
	}
});

export default store;