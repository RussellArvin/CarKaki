import Location from "~/server/api/types/location";

const APP_ROUTES = {
    CLERK_WEBHOOK:'/api/clerk',
    LANDING: '/',
    HOME: (location?: Location, navigate?: boolean) => {
        const params = new URLSearchParams();
        
        if (location) {
            params.set('x', location.x.toString());
            params.set('y', location.y.toString());
        }
        
        if (navigate !== undefined) {
            params.set('navigate', navigate.toString());
        }
    
        const queryString = params.toString();
        return `/app${queryString ? `?${queryString}` : ''}`;
    },
    SETTINGS: {
        MAIN: '/app/settings',
        NAME: '/app/settings/name',
        PASSWORD:'/app/settings/password',
        DELETE: '/app/settings/delete'
    },
    PROFILE: {
        MAIN: '/app/profile',
        FAVOURITE: '/app/profile/favourite-carparks',
        SAVED: '/app/profile/saved-carparks',
        HISTORY: '/app/profile/parking-history',
        FREQUENT_CARPARKS: '/app/profile/frequent-carparks'
    },
    CARPARK: (carParkId: string) => `/app/carpark/${carParkId}`
}

export default APP_ROUTES;