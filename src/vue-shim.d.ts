
// 意思是告诉 TypeScript *.vue 后缀的文件可以交给 vue 模块来处理
import Vue from "vue";
import lodash from "lodash";

declare module '*.vue' {
    export default Vue
}

declare module 'vue/types/vue' {
    interface Vue {
        $Message: any,
        $Modal: any
    }
}

declare global {
    const _: typeof lodash
}

