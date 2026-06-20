import { Card } from '@/components/ui/card'
import { Map } from '@/components/ui/map'

import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
} from '../constants/map-config'

export function MapView() {
    return (
        <Card className="overflow-hidden p-0 h-[600px]">
            <Map
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
            />
        </Card>
    )
}