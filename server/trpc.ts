import { initTRPC } from '@trpc/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export const createTRPCContext = async () => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    supabase,
    user,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new Error('Unauthorized')
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  })
})
