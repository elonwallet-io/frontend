import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin(nuxtApp => {
    const customTheme = {
        dark: false,
        colors: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            primary: '037dd6',
            'primary-darken-1': '#3700B3',
            secondary: '#03DAC6',
            'secondary-darken-1': '#018786',
            error: '#B00020',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
        }
    }

    const vuetify = createVuetify({
        ssr: true,
        components,
        directives,
        theme: {
            defaultTheme: 'customTheme',
            themes: {
                customTheme,
            }
        }
    })

    nuxtApp.vueApp.use(vuetify)
})
