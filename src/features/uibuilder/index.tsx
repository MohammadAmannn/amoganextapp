import React from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import UIBuilder from '@/components/ui/ui-builder'
import { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions'
import { customComponentDefinitions } from '@/lib/ui-builder/registry/custom-component-definitions'
import { shadcnComponentDefinitions } from '@/lib/ui-builder/registry/shadcn-component-definitions'
import { blockDefinitions } from '@/lib/ui-builder/registry/block-definitions'

// Merge component registry definitions for the builder
const componentRegistry = {
  ...primitiveComponentDefinitions,
  ...customComponentDefinitions,
  ...shadcnComponentDefinitions,
}

export default function UIBuilderFeature() {
  return (
    <div className='flex h-full flex-col w-full overflow-hidden bg-background text-foreground'>
      <AppHeader title='UI Template' />
      <Main fixed className='flex flex-col flex-grow flex-1 min-h-0 overflow-hidden p-0!'>
        <UIBuilder
          componentRegistry={componentRegistry}
          blocks={blockDefinitions}
          persistLayerStore={true}
          allowVariableEditing={true}
          allowPagesCreation={true}
          allowPagesDeletion={true}
        />
      </Main>
    </div>
  )
}
