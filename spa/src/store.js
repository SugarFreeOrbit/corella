//Initialize store
import Vue from 'vue';
import Vuex from "vuex";
import router from "./router";
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
		}
	}, mutations: {
		logIn(state, {jwt, username, isAdmin}) {
			localStorage.setItem('jwt', jwt);
			localStorage.setItem('username', username);
			localStorage.setItem('isAdmin', isAdmin);
			state.user.loggedIn = true;
			state.user.jwt = jwt;
			state.user.isAdmin = isAdmin;
			state.user.username = username;
		},
		logOut(state) {
			localStorage.removeItem('jwt');
			localStorage.removeItem('username');
			localStorage.removeItem('isAdmin');
			state.user.jwt = '';
			state.user.isAdmin = false;
			state.user.username = '';
		}
	}, actions: {
		logOut({commit}) {
			commit('logOut');
			router.push('/spa/login');
		}
	}
});

export default store;