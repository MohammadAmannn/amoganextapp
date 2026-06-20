import { z } from 'zod'

export const uiCatalog = {
  Input: {
    props: z.object({
      label: z.string(),
      placeholder: z.string().optional(),
    }),
  },

  Textarea: {
    props: z.object({
      label: z.string(),
    }),
  },

  Button: {
    props: z.object({
      label: z.string(),
    }),
  },

  Select: {
    props: z.object({
      label: z.string(),
      options: z.array(z.string()),
    }),
  },

  Form: {
    props: z.object({}),
  },

  Card: {
    props: z.object({
      title: z.string(),
    }),
  },
}