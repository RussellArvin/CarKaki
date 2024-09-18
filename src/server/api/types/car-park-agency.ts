export const carParkAgency = ["HDB","LTA","URA"] as const
type CarParkAgency = typeof carParkAgency[number];

export default CarParkAgency