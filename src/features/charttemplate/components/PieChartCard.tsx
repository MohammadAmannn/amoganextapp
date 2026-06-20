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
    Pie,
    PieChart as RechartsPieChart,
} from "recharts"

const pieChartData = [
    { name: "Chrome", value: 275, fill: "var(--chart-1)" },
    { name: "Safari", value: 200, fill: "var(--chart-2)" },
    { name: "Firefox", value: 187, fill: "var(--chart-3)" },
    { name: "Edge", value: 173, fill: "var(--chart-4)" },
    { name: "Other", value: 90, fill: "var(--chart-5)" },
]

const pieChartConfig = {
    chrome: {
        label: "Chrome",
        color: "var(--chart-1)",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
    firefox: {
        label: "Firefox",
        color: "var(--chart-3)",
    },
    edge: {
        label: "Edge",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
}

export function PieChartCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pie Chart - Donut</CardTitle>
                <CardDescription>
                    Browser distribution
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={pieChartConfig}
                    className="h-[350px] w-full"
                >
                    <RechartsPieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            strokeWidth={5}
                        />
                        <ChartLegend
                            content={<ChartLegendContent />}
                        />
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
