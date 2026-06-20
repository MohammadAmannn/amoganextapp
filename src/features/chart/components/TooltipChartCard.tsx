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
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
} from "recharts"

const areaChartData = [
    { date: "Apr 6", desktop: 180, mobile: 120 },
    { date: "Apr 8", desktop: 320, mobile: 200 },
    { date: "Apr 10", desktop: 150, mobile: 90 },
    { date: "Apr 12", desktop: 240, mobile: 160 },
    { date: "Apr 14", desktop: 420, mobile: 280 },
    { date: "Apr 16", desktop: 200, mobile: 130 },
    { date: "Apr 18", desktop: 360, mobile: 240 },
    { date: "Apr 20", desktop: 180, mobile: 110 },
    { date: "Apr 22", desktop: 300, mobile: 210 },
    { date: "Apr 24", desktop: 160, mobile: 100 },
    { date: "Apr 26", desktop: 440, mobile: 300 },
    { date: "Apr 28", desktop: 220, mobile: 150 },
    { date: "Apr 30", desktop: 340, mobile: 230 },
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

export function TooltipChartCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Chart with Custom Tooltip</CardTitle>
                <CardDescription>
                    Hover to see detailed information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[350px] w-full"
                >
                    <AreaChart
                        accessibilityLayer
                        data={areaChartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent 
                                    labelFormatter={(value) => `Date: ${value}`}
                                    formatter={(value, name) => (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{name}:</span>
                                            <span className="font-bold">{value}</span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="var(--color-desktop)"
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                        />
                        <Area
                            dataKey="mobile"
                            type="natural"
                            fill="var(--color-mobile)"
                            fillOpacity={0.4}
                            stroke="var(--color-mobile)"
                        />
                        <ChartLegend
                            content={<ChartLegendContent />}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
