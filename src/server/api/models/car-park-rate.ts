interface CarParkRateProps {
    id: string
    carParkId: string
    startTime: string
    endTime: string
    weekDayRate: number
    weekDayMin: number
    satRate: number
    satMin: number
    sunPHRate: number
    sunPHMin: number
    createdAt: Date
    updatedAt: Date
}

export class CarParkRate {
    constructor(private readonly props: Readonly<CarParkRateProps>) {}

    public getValue(): CarParkRateProps {
        return { ...this.props };
    }
}