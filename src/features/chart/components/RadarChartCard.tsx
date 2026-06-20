import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
    Radar as RechartsRadar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
} from "recharts"

const radarChartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
}

export function RadarChartCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Radar Chart</CardTitle>
                <CardDescription>
                    Monthly performance metrics
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[350px] w-full"
                >
                    <RadarChart data={radarChartData}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <PolarGrid />
                        <PolarAngleAxis
                            dataKey="month"
                        />
                        <RechartsRadar
                            dataKey="desktop"
                            fill="var(--color-desktop)"
                            fillOpacity={0.6}
                            stroke="var(--color-desktop)"
                        />
                        <RechartsRadar
                            dataKey="mobile"
                            fill="var(--color-mobile)"
                            fillOpacity={0.6}
                            stroke="var(--color-mobile)"
                        />
                        <ChartLegend
                            content={<ChartLegendContent />}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
