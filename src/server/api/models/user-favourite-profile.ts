interface UserFavouriteProps {
    carParkId: string
    userId: string
    createdAt: Date
    deletedAt: Date | null
}

export class UserFavouriteProfile {
    constructor(private readonly props: Readonly<UserFavouriteProps>) {}

    public getValue(): UserFavouriteProps {
        return { ...this.props };
    }

    
    public delete(): UserFavouriteProfile {
        return new UserFavouriteProfile({
            ...this.props,
            deletedAt: new Date()
        })
    }

}
