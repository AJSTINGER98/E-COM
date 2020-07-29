import Vue from 'vue';
import App from './App.vue';
import scrollAnimation from './directives/scrollAnimation';
import jQuery from 'jquery';
import VueScrollmagic from 'vue-scrollmagic';
import VueRouter from 'vue-router';

import Home from './components/Home/Home.vue';
import Contact from './components/ContactUs/Contact.vue';
import productDetails from './components/Product/ProductDetails.vue';

Vue.use(VueRouter);
Vue.use(VueScrollmagic);

Vue.directive('scrollanimation', scrollAnimation);


const routes = [
  { path: '/', component: Home },
  { path: '/contact-us', component: Contact },
  {path: '/product/id', component: productDetails}
];

window.$ = jQuery;


Vue.config.productionTip = false;
const router = new VueRouter({
  routes,
  mode: 'history',
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
