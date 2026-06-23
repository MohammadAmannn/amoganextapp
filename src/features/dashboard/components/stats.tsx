import Stats01 from './stats/stats-01'
import Stats02 from './stats/stats-02'
import Stats03 from './stats/stats-03'
import Stats04 from './stats/stats-04'
import Stats05 from './stats/stats-05'
import Stats06 from './stats/stats-06'
import Stats07 from './stats/stats-07'
import Stats08 from './stats/stats-08'
import Stats09 from './stats/stats-09'
import Stats10 from './stats/stats-10'
import Stats11 from './stats/stats-11'
import Stats12 from './stats/stats-12'
import Stats13 from './stats/stats-13'
import { Stats14 } from './stats/stats-14'
import { Stats15 } from './stats/stats-15'

export function Stats() {
  return (
    <div className='space-y-12 pb-16'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-bold tracking-tight'>Stats Blocks</h2>
        <p className='text-sm text-muted-foreground'>
          A collection of 15 beautifully designed stats components from
          blocks.so.
        </p>
      </div>

      <div className='space-y-12'>
        <section className='space-y-4'>
          <div className=' pb-2'>
            <h3 className='text-lg font-semibold'>01. Stats with Trending</h3>
          </div>
          <div className='overflow-hidden rounded-xl  text-card-foreground shadow-xs'>
            <Stats01 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className='pb-2'>
            <h3 className='text-lg font-semibold'>02. Stats with Borders</h3>
          </div>
          <div className='overflow-hidden rounded-xl  text-card-foreground shadow-xs'>
            <Stats02 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              03. Stats with Card Layout
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats03 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>04. Stats with Badges</h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats04 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>05. Stats with Links</h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats05 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>06. Stats with Status</h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats06 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              07. Stats with Circular Progress
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats07 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              08. Stats with Circular Progress and Links
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats08 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>09. Stats with Progress</h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats09 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>10. Stats with Area Chart</h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats10 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              11. Stats Dashboard with Progress Bars
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats11 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>12. Stats Usage Dashboard</h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats12 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              13. Stats with Segmented Progress
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats13 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              14. Stats with Usage Breakdown
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats14 />
          </div>
        </section>

        <section className='space-y-4'>
          <div className=" pb-2">
            <h3 className='text-lg font-semibold'>
              15. Stats with Value Breakdown
            </h3>
          </div>
          <div className='overflow-hidden rounded-xl  bg-card text-card-foreground shadow-xs'>
            <Stats15 />
          </div>
        </section>
      </div>
    </div>
  )
}
