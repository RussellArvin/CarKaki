export const uraApiRequestType = ["INFO","AVAIL"] as const
type UraAPIRequestType = typeof uraApiRequestType[number]

export default UraAPIRequestType