export const lotType = ["C","H","Y"] as const
type LotType = typeof lotType[number]

export default LotType