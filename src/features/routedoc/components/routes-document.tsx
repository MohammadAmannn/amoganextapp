import React from 'react'
import { Navigation, Globe, ExternalLink, Calendar, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RouteInfo } from '../data/routes-data'
import Link from 'next/link'

interface RoutesDocumentProps {
  routes: RouteInfo[]
  selectedRoute: RouteInfo | null
}

export const RoutesDocument: React.FC<RoutesDocumentProps> = ({ routes, selectedRoute }) => {
  return (
    <div className='h-full overflow-y-auto pr-2 space-y-8 select-text no-scrollbar scroll-smooth'>
      {routes.map((route) => {
        const isSelected = selectedRoute?.path === route.path
        const elementId = `route-block-${route.path.replace(/\//g, '_')}`

        return (
          <div
            key={route.path}
            id={elementId}
            className={`space-y-3 transition-all duration-300 rounded-xl p-1.5 ${
              isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
            }`}
          >
            {/* Header Block: Path and Folder Badge */}
            <div className='flex items-center gap-2.5 pl-1'>
              <h3 className='text-[15px] font-mono font-bold text-foreground'>
                {route.path}
              </h3>
              <Badge variant='secondary' className='text-[10px] font-mono rounded bg-muted/60 text-muted-foreground py-0 h-4.5 px-1.5 font-bold uppercase'>
                {route.folder}
              </Badge>
            </div>

            {/* Navigate to Route Card */}
            <div className='bg-card border border-border/80 rounded-xl p-4.5 space-y-3 shadow-xs'>
              <div className='flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider pl-0.5'>
                <Navigation className='h-3.5 w-3.5 rotate-45 text-muted-foreground/60' />
                <span>Navigate to Route</span>
              </div>
              <div className='flex items-center justify-between gap-3 bg-muted/20 border border-border/60 rounded-lg p-2.5 pl-3'>
                <code className='text-xs font-mono font-bold text-muted-foreground select-all truncate'>
                  {route.path}
                </code>
                <Link href={route.path} passHref legacyBehavior>
                  <Button size='sm' className='h-8 px-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs gap-1.5 shrink-0 shadow-xs' asChild>
                    <a>
                      <ExternalLink className='h-3 w-3' />
                      <span>Visit</span>
                    </a>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sitemap Entries Card */}
            <div className='bg-card border border-border/80 rounded-xl p-4.5 space-y-3.5 shadow-xs'>
              <div className='flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider pl-0.5'>
                <Globe className='h-3.5 w-3.5 text-muted-foreground/60' />
                <span>Sitemap Entries</span>
                <Badge variant='outline' className='text-[9px] h-4.5 rounded-full px-1.5 py-0 font-bold bg-muted/40 text-muted-foreground/80'>
                  1
                </Badge>
              </div>
              
              {/* Sitemap Table */}
              <div className='border border-border/60 rounded-lg overflow-hidden'>
                <table className='w-full text-left border-collapse text-[11px] leading-normal'>
                  <thead>
                    <tr className='bg-muted/40 border-b border-border/50 text-muted-foreground/80 font-bold'>
                      <th className='py-2 px-3.5 font-semibold'>URL</th>
                      <th className='py-2 px-3.5 font-semibold'>Last Modified</th>
                      <th className='py-2 px-3.5 font-semibold text-center'>Priority</th>
                      <th className='py-2 px-3.5 text-right font-semibold'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors font-medium'>
                      <td className='py-2.5 px-3.5 font-mono text-muted-foreground truncate max-w-[200px] sm:max-w-xs'>
                        http://localhost:3000{route.path}
                      </td>
                      <td className='py-2.5 px-3.5 text-muted-foreground/80'>
                        —
                      </td>
                      <td className='py-2.5 px-3.5 text-center text-muted-foreground/80 font-mono'>
                        {route.priority.toFixed(1)}
                      </td>
                      <td className='py-2.5 px-3.5 text-right'>
                        <Link href={route.path} passHref legacyBehavior>
                          <Button variant='ghost' size='icon' className='h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted' asChild>
                            <a>
                              <ExternalLink className='h-3.5 w-3.5' />
                            </a>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
