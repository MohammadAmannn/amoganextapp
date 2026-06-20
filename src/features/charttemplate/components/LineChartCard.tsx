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
    Line,
    LineChart as RechartsLineChart,
    CartesianGrid,
    XAxis,
} from "recharts"

const lineChartData = [
    { month: "Jan", desktop: 186, mobile: 80 },
    { month: "Feb", desktop: 305, mobile: 200 },
    { month: "Mar", desktop: 237, mobile: 120 },
    { month: "Apr", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "Jun", desktop: 214, mobile: 140 },
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

export function LineChartCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Line Chart - Interactive</CardTitle>
                <CardDescription>
                    Monthly trends over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[350px] w-full"
                >
                    <RechartsLineChart
                        accessibilityLayer
                        data={lineChartData}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <ChartLegend
                            content={<ChartLegendContent />}
                        />
                        <Line
                            dataKey="desktop"
                            stroke="var(--color-desktop)"
                            strokeWidth={3}
                            dot={false}
                        />
                        <Line
                            dataKey="mobile"
                            stroke="var(--color-mobile)"
                            strokeWidth={3}
                            dot={false}
                        />
                    </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
