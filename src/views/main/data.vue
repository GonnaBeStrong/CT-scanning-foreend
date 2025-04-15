<template>
  <a-row>
    <a-col :span="4">
      <a-statistic title="总检测数目" :value="ctTotal" style="margin-right: 50px" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="神经胶质瘤"  :value="ctSJZ" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="脑膜瘤"  :value="ctNM" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="垂体腺瘤"  :value="ctCTX" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="正常"  :value="ctZC" />
    </a-col>
  </a-row>
  <div style="width: 60%; max-width: 300px; margin: 0 auto;">
    <canvas ref="pieChart"></canvas>
  </div>
  <a-row>
    <a-col :span="4">
      <a-statistic title="AI总问答数目" :value="ansTotal" style="margin-right: 50px" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="非常有帮助"  :value="ansYBZ" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="还可以"  :value="ansHKY" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="没帮助"  :value="ansYBB" />
    </a-col>
    <a-col :span="5">
      <a-statistic title="很差劲"  :value="ansHCJ" />
    </a-col>
  </a-row>
  <div style="width: 60%; max-width: 300px; margin: 0 auto;">
    <canvas ref="pieChart2"></canvas>
  </div>
</template>

<script>
import {ref, onMounted, onBeforeMount} from 'vue';
import Chart from 'chart.js/auto';
import axios from "axios";

export default {
  setup() {
    const pieChart = ref(null);
    const pieChart2 = ref(null);
    let dataA = ref([]);
    let dataB = ref([12, 19, 3, 5, 2]);
    let ctTotal = ref(0);
    let ctSJZ = ref(0);
    let ctNM = ref(0);
    let ctCTX = ref(0);
    let ctZC = ref(0);

    let ansTotal = ref(0);
    let ansYBZ = ref(0);
    let ansHKY = ref(0);
    let ansYBB = ref(0);
    let ansHCJ = ref(0);

const getData = () => {
  axios.get("http://localhost:8000/query-data").then((response)=>{
    const data = response.data;
    const numbersCT = data.numbersCT;
    dataA.value.push(numbersCT[1]);
    dataA.value.push(numbersCT[2]);
    dataA.value.push(numbersCT[3]);
    dataA.value.push(numbersCT[4]);

    ctTotal.value = numbersCT[0];
    ctSJZ.value = numbersCT[1];
    ctNM.value = numbersCT[2];
    ctCTX.value = numbersCT[3];
    ctZC.value = numbersCT[4];


    const numbersANS = data.numbersANS;
    dataB.value = [];
    dataB.value.push(numbersANS[1]);
    dataB.value.push(numbersANS[2]);
    dataB.value.push(numbersANS[3]);
    dataB.value.push(numbersANS[4]);

    ansTotal.value = numbersANS[0];
    ansYBZ.value = numbersANS[1];
    ansHKY.value = numbersANS[2];
    ansYBB.value = numbersANS[3];
    ansHCJ.value = numbersANS[4];


    const ctx = pieChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['神经胶质瘤', '脑膜瘤', '垂体腺瘤', '正常'],
          datasets: [{
            label: '# of Votes',
            data: dataA.value,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: '检测汇总'
            }
          }
        }
      });
      const ctx2 = pieChart2.value.getContext('2d');
      new Chart(ctx2, {
        type: 'pie',
        data: {
          labels: ['非常有帮助', '还可以', '没帮助', '很差劲'],
          datasets: [{
            label: '# of Votes',
            data: dataB.value,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: '检测汇总'
            }
          }
        }
      });
  })
}



    onMounted(() => {
      getData();
    });

    return {
      pieChart,
      pieChart2,
      ctTotal,
      ctCTX,
      ctNM,
      ctZC,
      ctSJZ,
      ansYBB,
      ansHCJ,
      ansHKY,
      ansTotal,
      ansYBZ
    };
  }
};
</script>