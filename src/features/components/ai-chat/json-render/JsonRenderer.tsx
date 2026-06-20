/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from 'react'
import { registry } from './registry'

interface JsonRendererProps {
  schema: any
  onAction?: (action: string, params?: any) => void
}

function normalizeSchema(schema: any): { root: string; elements: Record<string, any> } | null {
  if (!schema) return null

  let targetSchema = schema
  // Wrap array schemas in a Stack
  if (Array.isArray(schema)) {
    targetSchema = {
      type: 'Stack',
      children: schema,
    }
  }

  // If already in flat format with root and elements
  if (targetSchema.root && targetSchema.elements && typeof targetSchema.elements === 'object') {
    const normalizedElements = { ...targetSchema.elements }
    for (const key of Object.keys(normalizedElements)) {
      const el = normalizedElements[key]
      if (el && typeof el === 'object') {
        const { type, children, props, ...rest } = el
        normalizedElements[key] = {
          type,
          children,
          props: { ...rest, ...props }, // Merge top-level properties into props
        }
      }
    }
    return {
      root: targetSchema.root,
      elements: normalizedElements,
    }
  }

  // If elements is provided but root is missing, find the root key
  if (targetSchema.elements && typeof targetSchema.elements === 'object') {
    const keys = Object.keys(targetSchema.elements)
    if (keys.length > 0) {
      const childKeys = new Set<string>()
      for (const el of Object.values(targetSchema.elements) as any[]) {
        if (el?.children && Array.isArray(el.children)) {
          el.children.forEach((c: string) => childKeys.add(c))
        }
      }
      const rootKey = keys.find((k) => !childKeys.has(k)) || keys[0]
      return normalizeSchema({
        root: rootKey,
        elements: targetSchema.elements,
      })
    }
  }

  // Otherwise, it's a nested structure. Let's flatten it.
  const elements: Record<string, any> = {}
  let idCounter = 0

  function traverse(node: any): string {
    if (!node) return ''

    if (typeof node !== 'object') {
      const textId = `text-${idCounter++}`
      elements[textId] = {
        type: 'Text',
        props: { children: String(node) },
      }
      return textId
    }

    const nodeId =
      node.id ||
      node.key ||
      `${(node.type || 'element').toLowerCase()}-${idCounter++}`
    const type = node.type || 'Stack'

    // Identify children (children, fields, or elements)
    const rawChildren = node.children || node.fields || node.elements
    let childrenIds: string[] = []

    if (rawChildren) {
      if (Array.isArray(rawChildren)) {
        childrenIds = rawChildren.map((child: any) => traverse(child)).filter(Boolean)
      } else if (typeof rawChildren === 'object') {
        const childId = traverse(rawChildren)
        if (childId) childrenIds = [childId]
      }
    }

    // Extract props
    const props: Record<string, any> = {}
    const excludeKeys = [
      'type',
      'children',
      'fields',
      'elements',
      'id',
      'key',
      'props',
    ]

    for (const key of Object.keys(node)) {
      if (!excludeKeys.includes(key)) {
        props[key] = node[key]
      }
    }

    if (node.props && typeof node.props === 'object') {
      Object.assign(props, node.props)
    }

    // If it's a Text or Heading component and has string children/fields/elements, keep it as props.children
    if ((type === 'Text' || type === 'Heading') && typeof rawChildren === 'string') {
      props.children = rawChildren
      childrenIds = []
    }

    elements[nodeId] = {
      type,
      props,
      ...(childrenIds.length > 0 ? { children: childrenIds } : {}),
    }

    return nodeId
  }

  const rootId = traverse(targetSchema)
  if (!rootId) return null

  return {
    root: rootId,
    elements,
  }
}

export function JsonRenderer({ schema, onAction }: JsonRendererProps) {
  // Validate schema on mount and when it changes
  useEffect(() => {
    if (schema) {
      console.log('Rendering schema:', JSON.stringify(schema, null, 2))
    }
  }, [schema])

  const normalized = useMemo(() => normalizeSchema(schema), [schema])

  if (!schema) {
    return <div className="text-muted-foreground">No schema provided</div>
  }

  if (!normalized) {
    return (
      <div className="text-red-500 border border-red-200 bg-red-50 p-4 rounded-md">
        <p className="font-semibold">Invalid schema format</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm">View schema</summary>
          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-40">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  const renderElement = (elementId: string, elements: any): React.ReactNode => {
    const element = elements[elementId]
    if (!element) {
      return (
        <div className="text-red-500 border border-red-200 bg-red-50 p-3 rounded-md my-2 text-sm">
          Element "{elementId}" not found
        </div>
      )
    }

    const Component = registry[element.type as keyof typeof registry]
    if (!Component) {
      return (
        <div className="p-3 my-2 border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-md text-sm">
          Unknown component: <span className="font-mono bg-amber-100 dark:bg-amber-950/40 px-1 py-0.5 rounded">{element.type}</span>
        </div>
      )
    }

    // Build props
    const props = { ...element.props }

    // Handle children
    let children = null
    if (element.children && Array.isArray(element.children)) {
      children = element.children.map((childId: string) => renderElement(childId, elements))
    }

    // Handle actions
    if (props.onClick && onAction) {
      const actionName = props.onClick
      props.onClick = () => onAction(actionName, {})
    }

    // Handle form submit action
    if (element.type === 'Form' && props.onSubmit && onAction) {
      const actionName = props.onSubmit
      props.onSubmit = () => onAction(actionName, {})
    }

    // Handle checkbox special case
    if (element.type === 'Checkbox') {
      return <Component {...props} />
    }

    // Render with children
    if (children && React.Children.count(children) > 0) {
      return <Component {...props}>{children}</Component>
    }

    return <Component {...props} />
  }

  try {
    const rootElement = normalized.elements[normalized.root]
    if (!rootElement) {
      return (
        <div className="text-red-500 border border-red-200 bg-red-50 p-4 rounded-md">
          Root element "{normalized.root}" not found
        </div>
      )
    }

    return (
      <div className="w-full">
        {renderElement(normalized.root, normalized.elements)}
      </div>
    )
  } catch (error) {
    return (
      <div className="text-red-500 border border-red-200 bg-red-50 p-4 rounded-md">
        Error rendering schema: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }
}