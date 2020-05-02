import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faBars, faDownload, faTimes} from "@fortawesome/free-solid-svg-icons";
import {faGithub, faInstagram, faLinkedin, faYoutube} from "@fortawesome/free-brands-svg-icons";

library.add(faTimes);
library.add(faBars);
library.add(faYoutube);
library.add(faInstagram);
library.add(faLinkedin);
library.add(faGithub);
library.add(faDownload);

Vue.component('font-awesome-icon', FontAwesomeIcon);


Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');


// font-awesome for vue (guide links:
// https://blog.logrocket.com/full-guide-to-using-font-awesome-icons-in-vue-js-apps-5574c74d9b2d/
// https://medium.com/front-end-weekly/how-to-use-fon-awesome-5-on-vuejs-project-ff0f28310821