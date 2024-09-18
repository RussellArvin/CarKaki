interface UserReviewProps {
    carParkId: string
    userId: string
    rating: number
    description: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}

export class UserReviewProfile {
    constructor(private readonly props: Readonly<UserReviewProps>) {}

    public getValue(): UserReviewProps {
        return { ...this.props };
    }

    
    public delete(): UserReviewProfile {
        return new UserReviewProfile({
            ...this.props,
            deletedAt: new Date()
        })
    }

    public update(rating: number, description: string): UserReviewProfile {
        return new UserReviewProfile({
            ...this.props,
            rating,
            description,
            updatedAt: new Date
        })
    }

}
