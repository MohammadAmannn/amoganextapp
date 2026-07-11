// import { MapPin, Store } from 'lucide-react'
// import type { MapMarker } from '../types/marker'
// import { MARKER_ICON_CONFIG } from '../constants/map-config'

// interface MapMarkerProps {
//   marker: MapMarker
//   isActive?: boolean
//   onClick?: (marker: MapMarker) => void
// }

// export function MapMarkerComponent({ marker, isActive = false, onClick }: MapMarkerProps) {
//   const iconConfig = MARKER_ICON_CONFIG[marker.icon]
//   const IconComponent = marker.icon === 'pin' ? MapPin : Store

//   const handleClick = () => {
//     onClick?.(marker)
//   }

//   return (
//     <div
//       className={`
//         relative cursor-pointer transition-all duration-300 ease-in-out
//         hover:scale-110
//         ${isActive ? 'scale-110' : 'scale-100'}
//       `}
//       onClick={handleClick}
//       style={{
//         width: iconConfig.size,
//         height: iconConfig.size,
//         color: iconConfig.color,
//       }}
//       role="button"
//       aria-label={`Marker for ${marker.locationName}`}
//     >
//       {/* Main Icon */}
//       <IconComponent
//         size={iconConfig.size}
//         strokeWidth={isActive ? 2.5 : 2}
//         className="drop-shadow-lg transition-all duration-300"
//         fill={isActive ? iconConfig.color : 'transparent'}
//       />
      
//       {/* Glow effect for active marker */}
//       {isActive && (
//         <span 
//           className="absolute inset-0 rounded-full animate-pulse" 
//           style={{
//             background: `radial-gradient(circle, ${iconConfig.color}40 0%, transparent 70%)`,
//             transform: 'scale(1.8)',
//           }}
//         />
//       )}

//       {/* Hover tooltip */}
//       <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 backdrop-blur px-2 py-0.5 rounded text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
//         {marker.locationName}
//       </div>
//     </div>
//   )
// }