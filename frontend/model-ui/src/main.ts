import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config';

import Lara from '@primevue/themes/lara';
import Aura from '@primevue/themes/aura';
import Nora from '@primevue/themes/nora';
import 'primeicons/primeicons.css'
import Ripple from 'primevue/ripple';
import {definePreset} from "@primevue/themes";
import ToastService from 'primevue/toastservice';

const app = createApp(App);
const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{sky.50}',
            100: '{sky.100}',
            200: '{sky.200}',
            300: '{sky.300}',
            400: '{sky.400}',
            500: '{sky.500}',
            600: '{sky.600}',
            700: '{sky.700}',
            800: '{sky.800}',
            900: '{sky.900}',
            950: '{sky.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{sky.700}',
                    inverseColor: '#ffffff',
                    hoverColor: '{sky.900}',
                    activeColor: '{sky.800}'
                },
                highlight: {
                    background: '{cyan.600}',
                    focusBackground: '{cyan.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            }
        }
    }
});
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,

        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    },
    ripple: true
});



app.directive('ripple', Ripple);
app.use(router)
app.use(ToastService);
app.mount('#app')
