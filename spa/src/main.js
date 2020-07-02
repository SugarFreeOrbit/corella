import Vue from 'vue'
import App from './App.vue'
import store from "./store";
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import VueDataTables from 'vue-data-tables';
import { LayoutPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './element-variable.scss';

Vue.use(axios);
Vue.use(ElementUI);
Vue.use(LayoutPlugin);
Vue.use(VueDataTables);

//Load validators
const Ajv = require('ajv');
const ajv = new Ajv();
require('ajv-keywords')(ajv, 'uniqueItemProperties');
const validateRoles = ajv.compile(require('./utils/validationSchemas/roles'));
const validateColumns = ajv.compile(require('./utils/validationSchemas/columns'));
const validateNewIssue = ajv.compile(require('./utils/validationSchemas/newIssue'));
Vue.prototype.$schemaValidators = {
	validateRoles,
	validateColumns,
	validateNewIssue
};

//Set up axios instance
axios.defaults.baseURL = process.env.VUE_APP_BACKEND_HOST || "http://localhost:9080";
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.interceptors.request.use( function (config) {
	if (store.state.user.loggedIn) {
		const token = store.state.user.jwt;
		config.headers.common['Authorization'] = `Bearer ${token}`;
	}
	return config;
});
axios.interceptors.response.use(undefined, (error) => {
	if (error.request.status ===  0 || error.response.status === 401) {
		store.dispatch('logOut');
	}
	return Promise.reject(error);
});
Vue.prototype.$http = axios;

//Start the WS connection
Vue.prototype.$BACK_END = process.env.VUE_APP_BACKEND_HOST;



// set language to EN
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
locale.use(lang);

Vue.config.productionTip = false;
new Vue({
	router,
	store,
	render: function (h) { return h(App) }
}).$mount('#app');
