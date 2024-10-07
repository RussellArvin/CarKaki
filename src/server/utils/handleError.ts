import { TRPCError } from "@trpc/server";

const handleError = (err: unknown) => {
    if(err instanceof TRPCError) throw err;
    const e = err as Error;

    throw new TRPCError({
        code:"INTERNAL_SERVER_ERROR",
        message: e.message
    })
}

export default handleError