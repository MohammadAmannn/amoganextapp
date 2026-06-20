import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { MapView } from './components/map-view'

export default function MapPage() {
    return (
        <>
            <AppHeader title='Maps' />

            <Main fixed>
                <section className='space-y-6'>
                    {/* <div>
                        <h1 className='text-3xl font-bold'>Maps</h1>
                        <p className='text-muted-foreground'>
                            Geographic analytics dashboard
                        </p>
                    </div> */}

                    <MapView />
                </section>
            </Main>
        </>
    )
}