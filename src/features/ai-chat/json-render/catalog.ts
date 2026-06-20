/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { z } from 'zod'

// Define component types with proper Zod schemas
const componentTypes = {
  Form: {
    props: z.object({
      className: z.string().optional(),
      onSubmit: z.string().optional(),
    }),
    slots: ['default'],
  },
  Select: {
    props: z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
      options: z
        .array(
          z.union([
            z.string(),
            z.object({
              label: z.string(),
              value: z.string(),
            }),
          ])
        )
        .default([]),
      value: z.string().optional(),
    }),
  },
  Stack: {
    props: z.object({
      direction: z.enum(['vertical', 'horizontal']).default('vertical'),
      gap: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
      align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch'),
    }),
    slots: ['default'],
  },
  Card: {
    props: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      className: z.string().optional(),
      maxWidth: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full']).optional(),
      centered: z.boolean().optional(),
    }),
    slots: ['default'],
  },
  Grid: {
    props: z.object({
      cols: z.number().min(1).max(6).default(1),
      gap: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('md'),
      className: z.string().optional(),
    }),
    slots: ['default'],
  },
  StatCard: {
    props: z.object({
      title: z.string(),
      value: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      className: z.string().optional(),
    }),
  },
  Table: {
    props: z.object({
      headers: z.array(z.string()).default([]),
      rows: z.array(z.array(z.any())).default([]),
      className: z.string().optional(),
    }),
  },
  Avatar: {
    props: z.object({
      src: z.string().optional(),
      fallback: z.string().optional(),
      size: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
      className: z.string().optional(),
    }),
  },
  Icon: {
    props: z.object({
      name: z.string(),
      size: z.number().default(18),
      className: z.string().optional(),
    }),
  },
  Input: {
    props: z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
      type: z.enum(['text', 'email', 'password', 'number']).default('text'),
      value: z.string().optional(),
    }),
  },
  Textarea: {
    props: z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
      rows: z.number().optional(),
      value: z.string().optional(),
    }),
  },
  Button: {
    props: z.object({
      label: z.string(),
      variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default'),
      size: z.enum(['default', 'sm', 'lg', 'icon']).default('default'),
      onClick: z.string().optional(),
    }),
  },
  Checkbox: {
    props: z.object({
      label: z.string().optional(),
      checked: z.boolean().default(false),
    }),
  },
  Badge: {
    props: z.object({
      label: z.string(),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
    }),
  },
  Alert: {
    props: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      variant: z.enum(['default', 'destructive']).default('default'),
    }),
    slots: ['default'],
  },
  Separator: {
    props: z.object({
      orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    }),
  },
  Progress: {
    props: z.object({
      value: z.number().min(0).max(100).default(0),
      label: z.string().optional(),
    }),
  },
  Heading: {
    props: z.object({
      level: z.enum(['1', '2', '3', '4', '5', '6']).default('2'),
      children: z.string().optional(),
    }),
  },
  Text: {
    props: z.object({
      children: z.string().optional(),
      size: z.enum(['sm', 'base', 'lg', 'xl']).default('base'),
    }),
  },
  Price: {
    props: z.object({
      amount: z.string(),
      period: z.string().optional(),
    }),
  },
  FeatureList: {
    props: z.object({
      features: z.array(z.string()).default([]),
    }),
  },
  Tabs: {
    props: z.object({
      defaultValue: z.string().optional(),
      className: z.string().optional(),
      tabs: z.array(z.object({
        label: z.string(),
        value: z.string(),
        content: z.any().optional(),
      })).default([]),
    }),
  },
  Calendar: {
    props: z.object({
      mode: z.enum(['single', 'multiple', 'range']).default('single'),
      className: z.string().optional(),
    }),
  },
  Switch: {
    props: z.object({
      label: z.string().optional(),
      checked: z.boolean().default(false),
    }),
  },
  RadioGroup: {
    props: z.object({
      value: z.string().optional(),
      className: z.string().optional(),
      options: z.array(
        z.union([
          z.string(),
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        ])
      ).default([]),
    }),
  },
}

export const catalog = (defineCatalog as any)(
  schema as any,
  {
    components: componentTypes as any,
    actions: {
      submit: { params: z.object({}) },
      cancel: { params: z.object({}) },
      onAction: { params: z.object({ action: z.string() }) },
    },
  } as any
)

export const componentTypesList = Object.keys(componentTypes)
