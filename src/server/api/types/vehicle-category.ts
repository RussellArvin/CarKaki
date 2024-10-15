export const vehicleCategory = [ 'Car', 'Motorcycle', 'Heavy Vehicle' ] as const
type VehicleCategory = typeof vehicleCategory[number]

export default VehicleCategory