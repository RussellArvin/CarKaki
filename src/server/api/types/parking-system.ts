export const parkingSystem = ["C","B"] as const
type ParkingSystem = typeof parkingSystem[number]

export default ParkingSystem