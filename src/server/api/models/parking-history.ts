interface ParkingHistoryProps {
    id: string,
    startDate: Date
    endDate: Date | null
    carParkId: string
    userId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}

export class ParkingHistory {
    constructor(private readonly props: Readonly<ParkingHistoryProps>) {}

    public getValue(): ParkingHistoryProps {
        return { ...this.props };
    }

    public endParking(): ParkingHistory {
        return new ParkingHistory({
            ...this.props,
            endDate: new Date()
        })
    }

}
