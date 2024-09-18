interface ParkingHistoryProps {
    id: string,
    startDate: Date
    endDate: Date | null
    carParkId: string
    userId: string
    createdAt: Date
    updatedAt: Date
}

export class ParkingHistoryProfile {
    constructor(private readonly props: Readonly<ParkingHistoryProps>) {}

    public getValue(): ParkingHistoryProps {
        return { ...this.props };
    }

    public endParking(): ParkingHistoryProfile {
        return new ParkingHistoryProfile({
            ...this.props,
            endDate: new Date()
        })
    }

}
