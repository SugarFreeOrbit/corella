import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios';
import ElementUI from 'element-ui';
import { LayoutPlugin } from 'bootstrap-vue'
import 'element-ui/lib/theme-chalk/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(axios);
Vue.use(ElementUI);
Vue.use(LayoutPlugin);

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

Vue.config.productionTip = false;
new Vue({
	router,
	render: function (h) { return h(App) }
}).$mount('#app');
