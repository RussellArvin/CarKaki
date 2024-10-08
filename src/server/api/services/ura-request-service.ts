import { UrbanRedevelopmentAuthority } from "../external-apis/urban-redevelopment-authority";
import { RequestLog } from "../models/request-log";
import { requestLogRepository } from "../repositories"

export const checkAndMakeURARequests = async () => {
    return Promise.all([handleAvailabilityRequest, handleInformationRequest]);
};

const canMakeRequest = (request: RequestLog | null): boolean => {
    const hasRequestBefore = !!request; 
    return (request?.canMakeRequest() === true) || !hasRequestBefore;
}



const handleAvailabilityRequest = async () => {
    //TODO: MAPPER
    const latestRequest = await requestLogRepository.findLatestRequestOrNull("AVAIL");
    if(!canMakeRequest(latestRequest)) return;

    const ura = new UrbanRedevelopmentAuthority();
    return;
}

const handleInformationRequest = async () => {
    //TODO: MAPPER
    const latestRequest = await requestLogRepository.findLatestRequestOrNull("INFO");
    if(!canMakeRequest(latestRequest)) return;

    const ura = new UrbanRedevelopmentAuthority();
    return;
}