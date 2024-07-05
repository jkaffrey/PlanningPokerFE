import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { io } from 'socket.io-client';
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'); // Ensure this URL matches your backend server's URL
const app = createApp(App);

app.provide('socket', socket);
app.use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 3000
})
app.use(router);
app.mount('#app');
