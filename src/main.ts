import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import { piniaLocalStorage } from './utils/storage';

const app = createApp(App);
const pinia = createPinia();

// Add localStorage persistence plugin
pinia.use(piniaLocalStorage);

app.use(pinia);
app.mount('#app');
