export const vehicleCategory = ["C","H","Y"] as const
type VehicleCategory = typeof vehicleCategory[number]

export default VehicleCategory