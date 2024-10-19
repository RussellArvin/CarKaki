import { UserProps } from "../models/user";
import CurrentParking from "./current-parking";

interface UserDetails extends UserProps {
    currentParking: CurrentParking | null
}

export default UserDetails;