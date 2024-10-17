import { UraAPIRequestType } from "../types/ura-types";

interface RequestLogProps {
    id: string
    type: UraAPIRequestType
    createdAt: Date
}

const COOLDOWN_TIMES = {
    AVAIL: 5 * 60 * 1000, // 5 minutes in milliseconds
    INFO: 24 * 60 * 60 * 1000 // 1 day in milliseconds
};

export class RequestLog {
    constructor(private readonly props: Readonly<RequestLogProps>) {}

    public getValue(): RequestLogProps {
        return {...this.props};
    }

    public canMakeRequest(): boolean {
        const currentTime = new Date().getTime();
        const timeSinceLastReqeuest = currentTime - this.props.createdAt.getTime()

        if(this.props.type === 'AVAIL'){
            //TEMP CHANGE TO 1 DAY
            return timeSinceLastReqeuest >= COOLDOWN_TIMES.INFO
        }
        if(this.props.type === 'INFO'){
            return timeSinceLastReqeuest >= COOLDOWN_TIMES.INFO
        }

        return false;
    }

}
