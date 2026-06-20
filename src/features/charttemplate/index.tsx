import { useState } from "react"
import { 
    ChartArea, 
    BarChart3, 
    LineChart, 
    PieChart, 
    Radar, 
    Target, 
    Info 
} from "lucide-react"
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

// Import subcomponents
import { AreaChartCard } from "./components/AreaChartCard"
import { BarChartCard } from "./components/BarChartCard"
import { LineChartCard } from "./components/LineChartCard"
import { PieChartCard } from "./components/PieChartCard"
import { RadarChartCard } from "./components/RadarChartCard"
import { RadialChartCard } from "./components/RadialChartCard"
import { TooltipChartCard } from "./components/TooltipChartCard"

type ChartTab = "area" | "bar" | "line" | "pie" | "radar" | "radial" | "tooltip"

export default function ChartsPage() {
    const [activeTab, setActiveTab] = useState<ChartTab>("area")

    const tabs = [
        { id: "area", label: "Area Charts", icon: ChartArea },
        { id: "bar", label: "Bar Charts", icon: BarChart3 },
        { id: "line", label: "Line Charts", icon: LineChart },
        { id: "pie", label: "Pie Charts", icon: PieChart },
        { id: "radar", label: "Radar Charts", icon: Radar },
        { id: "radial", label: "Radial Charts", icon: Target },
        { id: "tooltip", label: "Tooltips", icon: Info },
    ] as const

    const renderChart = () => {
        switch (activeTab) {
            case "area":
                return <AreaChartCard />
            case "bar":
                return <BarChartCard />
            case "line":
                return <LineChartCard />
            case "pie":
                return <PieChartCard />
            case "radar":
                return <RadarChartCard />
            case "radial":
                return <RadialChartCard />
            case "tooltip":
                return <TooltipChartCard />
            default:
                return null
        }
    }

    return (
        <>
            <AppHeader title='Chart Template' />
            <Main fixed className="flex flex-col">
                <div className="p-8 w-full flex-1 overflow-y-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        {/* <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Chart Template</h1>
                            <p className="text-muted-foreground text-sm">
                                Beautiful charts and graphs for your data
                            </p>
                        </div> */}
                        {/* <Button variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                        </Button> */}
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="border-b flex space-x-2 mb-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 text-sm font-medium
                                        border-b-2 transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                                        }
                                    `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Chart Content */}
                    {renderChart()}
                </div>
            </Main>
        </>
    )
}
