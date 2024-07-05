<template>
  <div>
    <PieChart :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default {
  name: 'VotePieChart',
  components: {
    PieChart: Pie,
  },
  props: {
    data: {
      // type: any,
      required: true,
    },
  },
  computed: {
    chartData() {
      return {
        labels: Object.keys(this.data),
        datasets: [
          {
            label: 'Votes',
            backgroundColor: ['#8BBF9F'],
            data: Object.values(this.data),
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      };
    },
  },
};
</script>

<style scoped>
</style>