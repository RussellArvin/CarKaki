const APP_ROUTES = {
    CLERK_WEBHOOK:'/api/clerk',
    LANDING: '/',
    HOME:'/app',
    SETTINGS: {
        MAIN: '/app/settings',
        NAME: '/app/settings/name',
        PASSWORD:'/app/settings/password',
        DELETE: '/app/settings/delete'
    },
    CARPARK: (carParkId: string) => `/app/carpark/${carParkId}`
}

export default APP_ROUTES;