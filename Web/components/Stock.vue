<script setup>
    const props = defineProps({ data: Array });
    
    import VueApexCharts from 'vue3-apexcharts';

    const chartOptions = ref({
    chart: {
        id: 'area-chart',
        toolbar: {
            show: false
        }
    },

    xaxis: {
        categories: props.data.map(el => el.dateTime),
        labels: {
            show: false
        }
    },

    yaxis: {
        labels: {
            style: {
                colors: 'white'
            }
        }
    },

    title: {
        text: 'سعر السهم',
        align: 'center',

        style: {
            color: 'white'
        }
    },

    dataLabels: {
        enabled: false
    },
    
    stroke: {
        curve: 'smooth'
    },
    fill: {
        opacity: 0.3
    },
    
    colors: ['#A64D79'],
    markers: {
        size: 0
    },
    tooltip: {
        theme: 'dark',

        x: {
            format: 'dd MMM',
        },
    },
});

const series = ref([{
    name: 'السهم',
    data: props.data.map(el => el.indexPrice),
}, ]);
</script>

<template>
    <div>
        <VueApexCharts :options="chartOptions" :series="series" type="area" height="350" />
    </div>
</template>