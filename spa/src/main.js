import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios';
import ElementUI from 'element-ui';
import { LayoutPlugin } from 'bootstrap-vue'
import 'element-ui/lib/theme-chalk/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import Vuex from 'vuex';

Vue.use(axios);
Vue.use(ElementUI);
Vue.use(LayoutPlugin);
Vue.use(Vuex);

axios.defaults.baseURL = process.env.VUE_APP_BACKEND_HOST;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.interceptors.request.use( function (config) {
	if (localStorage.getItem('jwt')) {
		const token = localStorage.getItem('jwt');
		config.headers.common['Authorization'] = `Bearer ${token}`;
	}
	return config;
});
axios.interceptors.response.use(undefined, (error) => {
	if (error.request.status ===  0 || error.response.status === 401) {
		localStorage.removeItem('jwt');
		localStorage.removeItem('username');
		localStorage.removeItem('userId');
		localStorage.removeItem('apiKey');
		router.push({ path: '/spa/login'});
	}
	return Promise.reject(error);
});
Vue.prototype.$http = axios;

// set language to EN
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
locale.use(lang);

//Initialize store
let loggedIn;
let jwt = localStorage.getItem('jwt');
let isAdmin = localStorage.getItem('isAdmin');
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
		logIn({jwt, username, isAdmin}) {
			localStorage.setItem('jwt', jwt);
			localStorage.setItem('username', username);
			localStorage.setItem('isAdmin', isAdmin);
			state.user.loggedIn = true;
			state.user.jwt = jwt;
			state.user.isAdmin = isAdmin;
			state.user.username = username;
		},
		logOut() {
			localStorage.removeItem('jwt');
			localStorage.removeItem('username');
			localStorage.removeItem('isAdmin');
			state.user.jwt = '';
			state.user.isAdmin = false;
			state.user.username = '';
		}
	}
});

Vue.config.productionTip = false;
new Vue({
	router,
	render: function (h) { return h(App) }
}).$mount('#app');
