<template>
  <div
    :style="{ background: `url(${bg}) no-repeat 0 0 /100% 100%` }"
    class="box"
  >
    <div style="color: white" class="box-left">
      <div class="box-left-card">
        <section>
          <div>较上日+ {{ store.chinaAdd.severe || "未知" }}</div>
          <div>{{ store.chinaTotal.severe }}</div>
          <div>本土现有确诊</div>
        </section>
        <section>
          <div>较上日+ {{ store.chinaAdd.heal }}</div>
          <div>{{ store.chinaTotal.heal }}</div>
          <div>现有确诊</div>
        </section>
        <section>
          <div>较上日+ {{ store.chinaAdd.confirm }}</div>
          <div>{{ store.chinaTotal.confirm }}</div>
          <div>累计确诊</div>
        </section>
        <section>
          <div>较上日+ {{ store.chinaAdd.suspect || "未知" }}</div>
          <div>{{ store.chinaTotal.suspect }}</div>
          <div>无症状感染者</div>
        </section>
        <section>
          <div>较上日+ {{ store.chinaAdd.input }}</div>
          <div>{{ store.chinaTotal.input }}</div>
          <div>境外输入</div>
        </section>
        <section>
          <div>较上日+ {{ store.chinaAdd.dead }}</div>
          <div>{{ store.chinaTotal.dead }}</div>
          <div>累计死亡</div>
        </section>
      </div>
      <div class="box-left-pie"></div>
      <div class="box-left-line"></div>
    </div>
    <div class="box-center" id="map"></div>
    <div style="color: white" class="box-right">
      <table class="table" border="1" cellspacing="0">
        <thead>
          <tr>
            <th>地区</th>
            <th>新增确诊</th>
            <th>累计确诊</th>
            <th>治愈</th>
            <th>死亡</th>
          </tr>
        </thead>
        <transition-group
          tag="tbody"
          enter-active-class="animate__animated animate__flipInY"
        >
          <tr :key="item.id" v-for="item in store.item">
            <td align="center">{{ item.name }}</td>
            <td align="center">{{ item.today.confirm }}</td>
            <td align="center">{{ item.total.confirm }}</td>
            <td align="center">{{ item.total.heal }}</td>
            <td align="center">{{ item.total.dead }}</td>
          </tr>
        </transition-group>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import bg from "@/assets/2.jpg";
import { useStore } from "./stores";
import { ref, reactive, onMounted } from "vue";
import * as echarts from "echarts"; // echarts 5版本引入
import "./assets/china";
import { geoCoordMap } from "./assets/geoMap";
import "animate.css";

const store = useStore();

onMounted(async () => {
  await store.getList();
  initCharts();
  initPie();
  initLine();
});

const initCharts = () => {
  const city = store.list.areaTree[2].children;
  store.item = city[2].children;
  const data = city.map((v) => {
    return {
      name: v.name,
      value: geoCoordMap[v.name].concat(v.total.confirm),
      children: v.children,
    };
  });

  const charts = echarts.init(document.getElementById("map") as HTMLElement);
  charts.setOption({
    geo: {
      map: "china",
      aspectScale: 0.8,
      layoutCenter: ["50%", "50%"],
      layoutSize: "100%",
      itemStyle: {
        //  normal: {
        areaColor: {
          type: "linear-gradient",
          x: 0,
          y: 1200,
          x2: 1000,
          y2: 0,
          colorStops: [
            {
              offset: 0,
              color: "#152E6E", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#0673AD", // 50% 处的颜色
            },
          ],
          global: true, // 缺省为 false
        },
        shadowColor: "#0f5d9d",
        shadowOffsetX: 0,
        shadowOffsetY: 15,
        opacity: 0.5,
        // },
      },
      emphasis: {
        areaColor: "#0f5d9d",
      },

      regions: [
        {
          name: "南海诸岛",
          itemStyle: {
            areaColor: "rgba(0, 10, 52, 1)",
            borderColor: "rgba(0, 10, 52, 1)",
            //normal: {
            opacity: 0,
            label: {
              show: false,
              color: "#009cc9",
            },
            //},
          },
          label: {
            show: false,
            color: "#FFFFFF",
            fontSize: 12,
          },
        },
      ],
    },
    series: [
      {
        type: "map",
        map: "china",
        aspectScale: 0.8,
        layoutCenter: ["50%", "50%"], //地图位置
        layoutSize: "100%",
        label: {
          show: true,
          color: "#FFFFFF",
          fontSize: 12,
        },
        itemStyle: {
          areaColor: "#0c3653",
          borderColor: "#1cccff",
          borderWidth: 1.8,
        },
        emphasis: {
          areaColor: "#56b1da",
          label: {
            show: true,
            color: "#fff",
          },
        },
        data: data,
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        symbol: "pin",
        symbolSize: [45, 45],
        label: {
          show: true,
          color: "#fff",
          formatter(value: any) {
            return value.data.value[2];
          },
        },
        itemStyle: {
          color: "#1E90FF", //标志颜色
        },
        data: data,
      },
    ],
  });
  charts.on("click", (e: any) => {
    store.item = e.data.children;
  });
};

const initPie = () => {
  const charts = echarts.init(
    document.querySelector(".box-left-pie") as HTMLElement
  );

  const data = store.countriesDetail.map((item) => {
    return {
      name: item.name,
      value: item.today.confirm,
    };
  });

  charts.setOption({
    backgroundColor: "rgba(38, 58, 87, 0.9)",
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
          },
        },
        data,
      },
    ],
  });
};

const initLine = () => {
  const charts = echarts.init(
    document.querySelector(".box-left-line") as HTMLElement
  );
  const xAxisData = store.countriesDetail.map((v) => v.name);
  const data = store.countriesDetail.map((v) => v.today.confirm);
  charts.setOption({
    backgroundColor: "rgba(38, 58, 87, 0.9)",
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#fff",
        },
      },
    },
    label: {
      show: true,
    },
    series: [
      {
        data,
        type: "line",
        smooth: true,
      },
    ],
  });
};
</script>

<style lang="less">
* {
  padding: 0;
  margin: 0;
}
@itemColor: #41b0db;
@itemBg: rgba(38, 58, 87, 0.9);
@itemBorder: #212028;

html,
body,
#app {
  height: 100%;
  overflow: hidden;
}

.box {
  height: 100%;
  display: flex;
  overflow: hidden;
  &-left {
    width: 400px;
    &-card {
      display: grid;
      grid-template-columns: auto auto auto;
      grid-template-rows: auto auto;

      section {
        background: @itemBg;
        border: 1px solid @itemBorder;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;

        div:nth-child(2) {
          color: @itemColor;
          padding: 10px 0;
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
    &-pie {
      height: 320px;
      margin-top: 20px;
    }
    &-line {
      height: 320px;
      margin-top: 20px;
    }
  }
  &-center {
    flex: 1;
    margin: 0 10px;
  }
  &-right {
    width: 400px;
    .table {
      width: 100%;
      background: rgba(38, 58, 87, 0.9);
      tr {
        th {
          padding: 5px;
          white-space: nowrap;
        }
        td {
          padding: 5px 10px;
          width: 100px;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
