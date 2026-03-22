import { z } from 'zod'
import { router, protectedProcedure } from '@/server/trpc'

export const projectsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('projects')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }),

  getById: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('projects')
        .select('*')
        .eq('id', input.projectId)
        .eq('user_id', ctx.user.id)
        .single()

      if (error) throw error
      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        videoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('projects')
        .insert({
          user_id: ctx.user.id,
          name: input.name,
          description: input.description,
          category: input.category,
          video_url: input.videoUrl,
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('projects')
        .update({
          name: input.name,
          description: input.description,
          category: input.category,
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.projectId)
        .eq('user_id', ctx.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    }),

  delete: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('projects')
        .delete()
        .eq('id', input.projectId)
        .eq('user_id', ctx.user.id)

      if (error) throw error
      return { success: true }
    }),

  getAnalyses: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('analyses')
        .select('*')
        .eq('project_id', input.projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }),

  getReports: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('reports')
        .select('*')
        .eq('project_id', input.projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }),

  launchAnalysis: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        transcription: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('analyses')
        .insert({
          project_id: input.projectId,
          name: `Analysis ${new Date().toISOString()}`,
          status: 'processing',
          transcription: input.transcription,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  getValidation: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('physics_validations')
        .select('*')
        .eq('project_id', input.projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    }),

  getSovereigntyScore: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('sovereignty_scores')
        .select('*')
        .eq('project_id', input.projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    }),
})
