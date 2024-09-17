interface UserFavouriteProps {
    carParkId: string
    userId: string
    createdAt: Date
    deletedAt: Date | null
}

export class UserFavourite {
    constructor(private readonly props: Readonly<UserFavouriteProps>) {}

    public getValue(): UserFavouriteProps {
        return { ...this.props };
    }

    
    public delete(): UserFavourite {
        return new UserFavourite({
            ...this.props,
            deletedAt: new Date()
        })
    }

}
