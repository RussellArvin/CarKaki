interface UserProfileProps {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isDarkMode: boolean;
    isNotificationsEnabled: boolean
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    homeCarParkId: string | null;
    workCarParkId: string | null;
}

export class UserProfile {
    constructor(private readonly props: Readonly<UserProfileProps>) {}

    public getValue(): UserProfileProps {
        return { ...this.props };
    }

    public delete(): UserProfile {
        return new UserProfile({
            ...this.props,
            deletedAt: new Date()
        });
    }

    public setNames(firstName: string, lastName: string): UserProfile {
        return new UserProfile({
            ...this.props,
            firstName,
            lastName
        });
    }

    public setHomeCarPark(carParkId: string): UserProfile {
        return new UserProfile({
            ...this.props,
            homeCarParkId: carParkId
        });
    }

    public setWorkCarPark(carParkId: string): UserProfile {
        return new UserProfile({
            ...this.props,
            workCarParkId: carParkId
        });
    }

    public setNotifications(isNotificationsEnabled: boolean): UserProfile {
        return new UserProfile({
            ...this.props,
            isNotificationsEnabled,
        })
    }

    public setDarkMode(isDarkMode: boolean) : UserProfile {
        return new UserProfile({
            ...this.props,
            isDarkMode,
        })
    }
}
