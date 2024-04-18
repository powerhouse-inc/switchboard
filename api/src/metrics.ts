import StatsD from 'hot-shots';
import type { MetricsClient } from '@prisma/client/runtime/library';


export const initMetrics = (prismaMetrics: MetricsClient) => {
    const statsd = new StatsD({
        port: 8125,
    })

    const diffMetrics = (metrics: any) => {
        return metrics.map((metric: any) => {
            let prev = 0
            const diffBuckets = metric.value.buckets.map((values: any) => {
                const [bucket, value] = values
                const diff = value - prev
                prev = value
                return [bucket, diff]
            })
            metric.value.buckets = diffBuckets
            return metric
        })
    }

    let previousHistograms: any = null
    const statsdSender = async () => {
        const metrics = await prismaMetrics.json()

        metrics.counters.forEach((counter: any) => {
            statsd.gauge('prisma.' + counter.key, counter.value, (...res) => { })
        })

        metrics.gauges.forEach((counter: any) => {
            statsd.gauge('prisma.' + counter.key, counter.value, (...res) => { })
        })

        if (previousHistograms === null) {
            previousHistograms = diffMetrics(metrics.histograms)
            return
        }

        let diffHistograms = diffMetrics(metrics.histograms)

        diffHistograms.forEach((diffHistograms: any, histogramIndex: any) => {
            diffHistograms.value.buckets.forEach((values: any, bucketIndex: any) => {
                const [bucket, count] = values
                const [_, prev] =
                    previousHistograms[histogramIndex].value.buckets[bucketIndex]
                const change = count - prev

                for (let sendTimes = 0; sendTimes < change; sendTimes++) {
                    statsd.timing('prisma.' + diffHistograms.key, bucket)
                }
            })
        })

        previousHistograms = diffHistograms
    }

    setInterval(async () => await statsdSender(), 10000);
}