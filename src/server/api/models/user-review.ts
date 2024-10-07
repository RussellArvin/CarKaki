interface UserReviewProps {
    carParkId: string
    userId: string
    rating: number
    description: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}

export class UserReview {
    constructor(private readonly props: Readonly<UserReviewProps>) {}

    public getValue(): UserReviewProps {
        return { ...this.props };
    }

    
    public delete(): UserReview {
        return new UserReview({
            ...this.props,
            deletedAt: new Date()
        })
    }

    public update(rating: number, description: string): UserReview {
        return new UserReview({
            ...this.props,
            rating,
            description,
            updatedAt: new Date
        })
    }

}
