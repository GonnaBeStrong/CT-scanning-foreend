<template>
    <a-layout-sider width="200" style="background: #fff">
        <a-menu
            v-model:selectedKeys="selectedKeys"
                mode="inline"
                :style="{ height: '100%', borderRight: 0 }"
        >
            <a-menu-item key="/ct-process">
                <router-link to="/ct-process">
                    <coffee-outlined />&nbsp;&nbsp;CT检测
                </router-link>
            </a-menu-item>
            <a-menu-item key="/req-ans">
                <router-link to="/req-ans">
                    <coffee-outlined />&nbsp;&nbsp;智能问诊
                </router-link>
            </a-menu-item>
            <a-menu-item key="/data">
                <router-link to="/data">
                    <coffee-outlined />&nbsp;&nbsp;数据看板
                </router-link>
            </a-menu-item>
            <a-menu-item key="/history-process">
                <router-link to="/history-process">
                    <coffee-outlined />&nbsp;&nbsp;历史检测记录
                </router-link>
            </a-menu-item>
        </a-menu>
    </a-layout-sider>
</template>

<script>
import {defineComponent, ref, watch} from "vue";
import router from "@/router";

export default defineComponent({
    name: "the-sider-view",
    setup() {
        const selectedKeys = ref([]);

        watch(() => router.currentRoute.value.path,(newValue) => {
            console.log('watch', newValue);
            selectedKeys.value = [];
            selectedKeys.value.push(newValue);
        },{immediate: true})

        return {
            selectedKeys
        };
    },
});
</script>


<style scoped>

</style>
