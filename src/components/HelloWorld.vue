<template>
  <div class="hello">
    <h1>{{ message }}</h1>
    <h2>Essential Links</h2>
    <button @click="onClick">Click!</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component({
    // 所有的组件选项都可以放在这里
  })
  export default class HelloWorld extends Vue {
    // 初始数据可以直接声明为实例的属性
    message: string = 'Welcome to Your Vue.js + TypeScript App'

    // 组件方法也可以直接声明为实例的方法
    onClick (): void {
      console.log(this.message)
      console.log(_)
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
