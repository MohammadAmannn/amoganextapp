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
    RadialBar,
    RadialBarChart,
} from "recharts"

const radialChartData = [
    { name: "Desktop", value: 186, fill: "var(--chart-1)" },
    { name: "Mobile", value: 80, fill: "var(--chart-2)" },
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

export function RadialChartCard() {
    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
                <CardTitle>Radial Chart</CardTitle>
                <CardDescription>
                    Completion metrics
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[350px] w-full"
                >
                    <RadialBarChart
                        data={radialChartData}
                        innerRadius={60}
                        outerRadius={130}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <RadialBar
                            dataKey="value"
                            background
                        />
                        <ChartLegend
                            content={<ChartLegendContent />}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
