interface UserProps {
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

export class User {
    constructor(private readonly props: Readonly<UserProps>) {}

    public getValue(): UserProps {
        return { ...this.props };
    }

    public delete(): User {
        return new User({
            ...this.props,
            deletedAt: new Date()
        });
    }

    public setNames(firstName: string, lastName: string): User {
        return new User({
            ...this.props,
            firstName,
            lastName
        });
    }

    public setHomeCarPark(carParkId: string): User {
        return new User({
            ...this.props,
            homeCarParkId: carParkId
        });
    }

    public setWorkCarPark(carParkId: string): User {
        return new User({
            ...this.props,
            workCarParkId: carParkId
        });
    }

    public setMainSettings(
        isNotificationsEnabled: boolean,
        isDarkMode: boolean
    ) {
        return new User({
            ...this.props,
            isNotificationsEnabled,
            isDarkMode
        })
    }
}
