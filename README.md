## vue+typescript+webpack4 项目搭建步骤


> 前言：
因为最近才开始接触Typescript，然后首先就是搭建环境，而网上教程时间比较久而且不全，所以在这里记录下手把手的详细脚印。🎉🎉🎉 

源码地址请戳 👇👇👇 
[vue-ts-init](https://github.com/persist-xyz/vue-ts-init)


### 1、初始化项目

```
vue init webpack vue-ts-init
cd vue-ts-init
npm install
```

脚手架项目webpack版本为3.6.0



### 2、webpack@3.6.0升级至webpack@4.37.0

方法一：使用yarn安装

```
yarn upgrade webpack@4.6.0
yarn add webpack-dev-server webpack-cli -D
```

方法二：手动修改package.json中webpack版本，重新安装，完成后

运行 `npm run build`， 报错



####  1、webpack.optimize.CommonsChunkPlugin

`Error: webpack.optimize.CommonsChunkPlugin has been removed, please use config.optimization.splitChunks instead`



原因：`CommonsChunkPlugin`已被webpack4废弃，推荐使用`SplitChunkPlugin`抽离公共模块



解决：找到 /build/webpack.prod.conf.js ，去掉如下配置

```javascript
new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks (module) {
    // any required modules inside node_modules are extracted to vendor
    return (
        module.resource &&
        /\.js$/.test(module.resource) &&
        module.resource.indexOf(
        path.join(__dirname, '../node_modules')
        )
    )
    }
}),
// extract webpack runtime and module manifest to its own file in order to
// prevent vendor hash from being updated whenever app bundle is updated
new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity
}),
// This instance extracts shared chunks from code splitted chunks and bundles them
// in a separate chunk, similar to the vendor chunk
// see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
new webpack.optimize.CommonsChunkPlugin({
    name: 'app',
    async: 'vendor-async',
    children: true,
    minChunks: 3
}),
```



 /build/webpack.prod.conf.js，添加

```javascript
const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  // 添加如下配置
  optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					chunks: "all",
					minChunks: 2,
					maxInitialRequests: 5, // The default limit is too small to showcase the effect
					minSize: 0 // This is example is too small to create commons chunks
				},
				vendor: {
					test: /node_modules/,
					chunks: "all",
					name: "vendor",
					priority: 10,
					enforce: true
				}
			}
		}
	},
	......
})
```



附：[官方的例子 common-chunk-and-vendor-chunk](https://github.com/webpack/webpack/tree/master/examples/common-chunk-and-vendor-chunk)

```javascript
optimization: {
    //提取公共模块，webpack4去除了CommonsChunkPlugin，使用SplitChunksPlugin作为替代
    //主要用于多页面
    //例子代码 https://github.com/webpack/webpack/tree/master/examples/common-chunk-and-vendor-chunk
    //SplitChunksPlugin配置，其中缓存组概念目前不是很清楚
    splitChunks: {
        // 表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
        chunks: "all",
        // 表示在压缩前的最小模块大小，默认为0；
        minSize: 30000,
        //表示被引用次数，默认为1
        minChunks: 1,
        //最大的按需(异步)加载次数，默认为1；
        maxAsyncRequests: 3,
        //最大的初始化加载次数，默认为1；
        maxInitialRequests: 3,
        // 拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；设置ture则使用默认值
        name: true,
        //缓存组，目前在项目中设置cacheGroup可以抽取公共模块，不设置则不会抽取
        cacheGroups: {
            //缓存组信息，名称可以自己定义
            commons: {
                //拆分出来块的名字,默认是缓存组名称+"~" + [name].js
                name: "test",
                // 同上
                chunks: "all",
                // 同上
                minChunks: 3,
                // 如果cacheGroup中没有设置minSize，则据此判断是否使用上层的minSize，true：则使用0，false：使用上层minSize
                enforce: true,
                //test: 缓存组的规则，表示符合条件的的放入当前缓存组，值可以是function、boolean、string、RegExp，默认为空；
                test:""
            },
            //设置多个缓存规则
            vendor: {
                test: /node_modules/,
                chunks: "all",
                name: "vendor",
                //表示缓存的优先级
                priority: 10,
                enforce: true
            }
        }
    }
}
```





#### 2、compilation.mainTemplate.applyPluginsWaterfall

再运行 `npm run build`， 报错



```
building for production.../Users/xyz_persist/front_end/ts/vue-ts-init2/node_modules/html-webpack-plugin/lib/compiler.js:81
        var outputName = compilation.mainTemplate.applyPluginsWaterfall('asset-path', outputOptions.filename, {
                                                  ^

TypeError: compilation.mainTemplate.applyPluginsWaterfall is not a function
```



原因：`html-webpack-plugin`未升级版本导致



解决：升级 `html-webpack-plugin` 版本

```
npm i html-webpack-plugin@3.2.0

npm i vue-loader@15.7.1
```





#### 3、Error: Chunk.entrypoints: Use Chunks.groupsIterable and filter by instanceof Entrypoint instead

再运行 `npm run build`， 报错



```
⠋ building for production...(node:13954) DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead
⠼ building for production...(node:13954) UnhandledPromiseRejectionWarning: Error: Chunk.entrypoints: Use Chunks.groupsIterable and filter by instanceof Entrypoint instead
```



原因：extract-text-webpack-plugin还不能支持webpack4.0.0以上的版本

[官网extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin)



解决：升级 `extract-text-webpack-plugin` 版本

`npm i extract-text-webpack-plugin@next -D`



> 注：extract-text-webpack-plugin作用：
>
> 将所有入口chunk中引用的.css抽离到独立的css文件中，而不再内嵌到JS bundle中。
>
> 如果样式文件大小较大，会更快提前加载，因为`CSS bundle` 会跟 `JS bundle`并行加载





#### 4、TypeError: Cannot read property 'eslint' of undefined

再运行 `npm run build`， 报错

```
TypeError: Cannot read property 'eslint' of undefined
    at Object.module.exports (/Users/xyz_persist/front_end/ts/vue-ts-init2/node_modules/eslint-loader/index.js:148:18)


TypeError: Cannot read property 'vue' of undefined
    at Object.module.exports (/Users/xyz_persist/front_end/ts/vue-ts-init2/node_modules/vue-loader/lib/loader.js:61:18)
 @ ./src/main.js 4:0-24 13:21-24
 ......
```



原因：eslint-loader、vue-loader版本问题

解决：

```
npm i eslint-loader@2.2.1 -D
npm i vue-loader@15.7.1 -D
```





#### 5、Make sure to include VueLoaderPlugin in your webpack config

再运行 `npm run build`， 报错



```reStructuredText
ERROR in ./src/App.vue
Module Error (from ./node_modules/vue-loader/lib/index.js):
vue-loader was used without the corresponding plugin. Make sure to include VueLoaderPlugin in your webpack config.
 @ ./src/main.js 4:0-24 13:21-24

```



原因：Vue-loader在15.*之后的版本都是 vue-loader的使用都是需要伴生 VueLoaderPlugin的



解决：在/build/webpack.base.conf.js中添加

```javascript
const VueLoaderPlugin = require('vue-loader/lib/plugin');
module.exports = {
......
plugins: [
     new VueLoaderPlugin()
	],
}
```





#### 6、Error: Path variable [contenthash] not implemented in this context: static/css/[name].[contenthash].css

再运行 `npm run build`， 报错



原因：webpack4.x中提取CSS文件应该使用`mini-css-extract-plugin`，废弃`extract-text-webpack-plugin`



[官网mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)



解决：在`/build/webpack.prod.conf.js`中

```javascript
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

...
plugins: [
    ...
    // new ExtractTextPlugin({
    //   filename: utils.assetsPath('css/[name].[contenthash].css'),
    //   allChunks: true,
    // }),
    new MiniCssExtractPlugin({
      filename: 'css/app.[name].css',
      chunkFilename: 'css/app.[contenthash:12].css'  // use contenthash *
    }),
]
```



再修改/build/utils.js文件

```javascript
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
...
    if (options.extract) {
      // return ExtractTextPlugin.extract({
      //   use: loaders,
      //   fallback: 'vue-style-loader'
      // })
      // MiniCssExtractPlugin.loader,
      return [MiniCssExtractPlugin.loader].concat(loaders)
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
```



至此，`npm run build`已经能够正常打包，生产环境搞定



#### 7、BaseClient.js?e917:12 Uncaught TypeError: Cannot assign to read only property 'exports' of object '#<Object>

运行 `npm run dev`， 命令行没有报错

打开浏览器，控制台报错

```
BaseClient.js?e917:12 Uncaught TypeError: Cannot assign to read only property 'exports' of object '#<Object>'
    at Module.eval (BaseClient.js?e917:12)
    at eval (BaseClient.js:42)
    at Module../node_modules/webpack-dev-server/client/clients/BaseClient.js (app.js:2061)
    at __webpack_require__ (app.js:727)
    at fn (app.js:101)
    at Module.eval (SockJSClient.js?810f:26)
    at eval (SockJSClient.js:137)
    at Module../node_modules/webpack-dev-server/client/clients/SockJSClient.js (app.js:2073)
    at __webpack_require__ (app.js:727)
    at fn (app.js:101)
```



原因：根据字面意思，猜测是解析JS的时候不认识 exports



解决：/build/webpack.base.conf.js 中

```
{
        test: /\.js$/,
        loader: 'babel-loader',
        // include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
        include: [resolve('src'), resolve('test')]
},
```



至此，`npm run dev` 编译没问题，开发环境搞定！





#### tips：

webpack4.x版本，其他插件修改：
`NoEmitOnErrorsPlugin` 废弃，使用`optimization.noEmitOnErrors`替代，在生产环境中默认开启
`ModuleConcatenationPlugin` 废弃，使用`optimization.concatenateModules`替代，在生产环境默认开启
`NamedModulesPlugin` 废弃，使用`optimization.namedModules`替代，在生产环境默认开启
`uglifyjs-webpack-plugin`升级到了v1.0版本，默认开启缓存和并行功能
`CommonsChunkPlugin` 被删除



#### 8、总结

- 用于进行文件分离的内置插件 `webpack.optimize.CommonsChunkPlugin` ，在Webpack 4.x中，我们借助于`config.optimization`来实现
- 用于压缩JS和CSS的内置插件`webpack.optimize.UglifyJsPlugin` 、 `webpack.optimize.OptimizeCSSPlugin` ，在Webpack 4.x中都取消了，但是可使用`UglifyJsPlugin`及`OptimizeCSSPlugin`插件来代替
- 用于提取CSS到单独文件的插件`extract-text-webpack-plugin` , 在webpack 4.x中则应该使用`mini-css-extract-plugin` 
- Webpack 4.x版本，Vue项目的`vue-loader`也必须更新到15.0以上版本



附：https://github.com/webpack-contrib/mini-css-extract-plugin



### 3、Vue 引入 TypeScript



#### 1、安装插件

```
npm i vue-class-component vue-property-decorator --save
npm i ts-loader typescript tslint tslint-loader tslint-config-standard --save-dev
```



这些库大体的作用：

- [vue-class-component](https://github.com/vuejs/vue-class-component)：强化 Vue 组件，使用 TypeScript/装饰器 增强 Vue 组件
- [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator)：在 `vue-class-component` 上增强更多的结合 Vue 特性的装饰器
- [ts-loader](https://github.com/TypeStrong/ts-loader)：TypeScript 为 Webpack 提供了 `ts-loader`，其实就是为了让webpack识别 .ts .tsx文件
- [tslint-loader](https://github.com/wbuchwalter/tslint-loader)跟[tslint](https://github.com/palantir/tslint)：我想你也会在`.ts` `.tsx`文件 约束代码格式（作用等同于eslint）
- [tslint-config-standard](https://github.com/blakeembrey/tslint-config-standard)：`tslint` 配置 `standard`风格的约束



#### 2、配置 webpack

找到/build/webpack.base.conf.js

- 将 `entry.app` 将`main.js` 改成 `main.ts`，顺便把项目文件中的`main.js`也改成`main.ts`, 里面内容保持不变

```javascript
entry: {
  app: './src/main.ts'
}
```

- 找到`resolve.extensions` 里面加上`.ts` 后缀 （是为了之后引入.ts的时候不写后缀）

```javascript
resolve: {
    extensions: ['.js', '.vue', '.json', '.ts'],
    alias: {
        '@': resolve('src')
    }
}
```

- 找到`module.rules` 添加webpack对`.ts`的解析

```javascript
module: {
  rules: [
    ....
		// 新增以下配置
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: { appendTsxSuffixTo: [/\.vue$/] }
          },
          {
            loader: 'tslint-loader'
          }
        ]
     },
		....
  }
}
```

注：`ts-loader` 会检索当前目录下的 `tsconfig.json` 文件，根据里面定义的规则来解析`.ts`文件（就跟`.babelrc`的作用一样），`tslint-loader` 作用等同于 `eslint-loader`



#### 3、添加 tsconfig.json

在根路径下创建`tsconfig.json`文件，完整配置见[tsconfig.json](http://json.schemastore.org/tsconfig)

这是我本地的配置

```json
{
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules"
    ],
    "compilerOptions": {
        // 解析非相对模块名的基准目录
        "baseUrl": ".",
        // 指定特殊模块的路径
        "paths": {
            "@/*": ["*", "src/*"]
        },
        "jsx": "preserve",
        "jsxFactory": "h",
        // 允许从没有设置默认导出的模块中默认导入
        "allowSyntheticDefaultImports": true,
        // 启用装饰器
        "experimentalDecorators": true,
        // 允许编译javascript文件
        "allowJs": true,
        // 采用的模块系统
        "module": "esnext",
        // 编译输出目标 ES 版本
        "target": "es5",
        // 如何处理模块
        "moduleResolution": "node",
        // 将每个文件作为单独的模块
        "isolatedModules": true,
        // 编译过程中需要引入的库文件的列表
        "lib": [
            "dom",
            "es5",
            "es6",
            "es7",
            "es2015.promise"
        ],
        "sourceMap": true,
        "pretty": true
    }
}
```



贴一份参考的配置

```json
{
  // 编译选项
  "compilerOptions": {
    // 输出目录
    "outDir": "./output",
    // 是否包含可以用于 debug 的 sourceMap
    "sourceMap": true,
    // 以严格模式解析
    "strict": true,
    // 采用的模块系统
    "module": "esnext",
    // 如何处理模块
    "moduleResolution": "node",
    // 编译输出目标 ES 版本
    "target": "es5",
    // 允许从没有设置默认导出的模块中默认导入
    "allowSyntheticDefaultImports": true,
    // 将每个文件作为单独的模块
    "isolatedModules": false,
    // 启用装饰器
    "experimentalDecorators": true,
    // 启用设计类型元数据（用于反射）
    "emitDecoratorMetadata": true,
    // 在表达式和声明上有隐含的any类型时报错
    "noImplicitAny": false,
    // 不是函数的所有返回路径都有返回值时报错。
    "noImplicitReturns": true,
    // 从 tslib 导入外部帮助库: 比如__extends，__rest等
    "importHelpers": true,
    // 编译过程中打印文件名
    "listFiles": true,
    // 移除注释
    "removeComments": true,
    "suppressImplicitAnyIndexErrors": true,
    // 允许编译javascript文件
    "allowJs": true,
    // 解析非相对模块名的基准目录
    "baseUrl": "./",
    // 指定特殊模块的路径
    "paths": {
      "jquery": [
        "node_modules/jquery/dist/jquery"
      ]
    },
    // 编译过程中需要引入的库文件的列表
    "lib": [
      "dom",
      "es2015",
      "es2015.promise"
    ]
  }
}
```



#### 4、添加 tslint.json

在根路径下创建`tslint.json`文件，就是 引入 `ts` 的 `standard` 规范

```json
{
    "defaultSeverity": "error",
    "extends": "tslint-config-standard",
    "globals": {
        "require": true
    },
    "rules": {
        "space-before-function-paren": false,
        "whitespace": [false],
        "no-consecutive-blank-lines": false,
        "no-angle-bracket-type-assertion": false,
        "no-empty-character-class": false
    }
}
```



#### 5、让 ts 识别 .vue

由于 `TypeScript` 默认并不支持 `*.vue` 后缀的文件，所以在 `vue` 项目中引入的时候需要创建一个 `vue-shim.d.ts` 文件，放在项目项目对应使用目录下，例如 `src/vue-shim.d.ts`

```typescript
// 意思是告诉 TypeScript *.vue 后缀的文件可以交给 vue 模块来处理
import Vue from "vue";
import lodash from "lodash";
// 重要***
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

```

而在代码中导入 `*.vue` 文件的时候，需要写上 `.vue` 后缀。原因还是因为 `TypeScript` 默认只识别 `*.ts` 文件，不识别 `*.vue` 文件

`import HelloWorld from '@/components/HelloWorld.vue'`



#### 6、改造 `.vue` 文件

在这之前先让我们了解一下所需要的插件（下面的内容需要掌握`es7`的[装饰器](http://taobaofed.org/blog/2015/11/16/es7-decorator/), 就是下面使用的@符号）



##### vue-class-component

[vue-class-component](https://github.com/vuejs/vue-class-component) 对 `Vue` 组件进行了一层封装，让 `Vue` 组件语法在结合了 `TypeScript` 语法之后更加扁平化：

```vue
<template>
  <div>
    <input v-model="msg">
    <p>msg: {{ msg }}</p>
    <p>computed msg: {{ computedMsg }}</p>
    <button @click="greet">Greet</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component
  export default class App extends Vue {
    // 初始化数据
    msg = 123

    // 声明周期钩子
    mounted () {
      this.greet()
    }

    // 计算属性
    get computedMsg () {
      return 'computed ' + this.msg
    }

    // 方法
    greet () {
      alert('greeting: ' + this.msg)
    }
  }
</script>
```

上面的代码跟下面的代码作用是一样的

```javascript
export default {
  data () {
    return {
      msg: 123
    }
  }

  // 声明周期钩子
  mounted () {
    this.greet()
  }

  // 计算属性
  computed: {
    computedMsg () {
      return 'computed ' + this.msg
    }
  }

  // 方法
  methods: {
    greet () {
      alert('greeting: ' + this.msg)
    }
  }
}
```



##### vue-property-decorator

[vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) 是在 `vue-class-component` 上增强了更多的结合 `Vue` 特性的装饰器，新增了这 7 个装饰器：

- `@Emit`
- `@Inject`
- `@Model`
- `@Prop`
- `@Provide`
- `@Watch`
- `@Component` (从 `vue-class-component` 继承)

在这里列举几个常用的`@Prop/@Watch/@Component`, 更多信息，详见[官方文档](https://github.com/kaorun343/vue-property-decorator)

```vue
import { Component, Emit, Inject, Model, Prop, Provide, Vue, Watch } from 'vue-property-decorator'

@Component
export class MyComponent extends Vue {
  
  @Prop()
  propA: number = 1

  @Prop({ default: 'default value' })
  propB: string

  @Prop([String, Boolean])
  propC: string | boolean

  @Prop({ type: null })
  propD: any

  @Watch('child')
  onChildChanged(val: string, oldVal: string) { }
}
```

上面的代码相当于：

```vue
export default {
  props: {
    checked: Boolean,
    propA: Number,
    propB: {
      type: String,
      default: 'default value'
    },
    propC: [String, Boolean],
    propD: { type: null }
  }
  methods: {
    onChildChanged(val, oldVal) { }
  },
  watch: {
    'child': {
      handler: 'onChildChanged',
      immediate: false,
      deep: false
    }
  }
}
```



##### 开始修改`App.vue`文件

1. 在`script` 标签上加上 `lang="ts"`, 意思是让`webpack`将这段代码识别为`typescript` 而非`javascript`
2. 修改vue组件的构造方式，详见[官方](https://cn.vuejs.org/v2/guide/typescript.html#基于类的-Vue-组件) 
3. 用`vue-property-decorator`语法改造之前代码

如下：

```javascript
<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component({})
  export default class App extends Vue {}

</script>
```



##### 开始修改HelloWorld.vue

如下：

```vue
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
```



至此，运行`npm run dev`	`npm run build` 都能正常跑起来了



### 4、进阶TS配置

#### 1、支持es6 / es7

在 `tsconfig.json`中，添加对`es6 / es7`的支持，更多的配置请见[tsconfig - 编译选项](https://tslang.cn/docs/handbook/compiler-options.html)

```
    "lib": [
      "dom",
      "es5",
      "es6",
      "es7",
      "es2015.promise"
    ]
```



#### 2、让 vue 识别全局方法/变量

在创建的 `src/vue-shim.d.ts`文件中，增加如下代码

```tsx
// 声明全局方法
declare module 'vue/types/vue' {
  interface Vue {
    $Message: any,
    $Modal: any
  }
}
```

这样，之后再使用this.$message()的话就不会报错了



#### 3、支持 ProvidePlugin 的全局变量，比如 lodash 的 _

如果我们在项目中有使用 `jquery，lodash` 这样的工具库的时候，肯定不希望在所有用到的地方都`import _ from ‘lodash’`

那我们就来配置一下：

首先还是在`webpack.base.conf.js` 中添加一个插件、并把这个 `vendor`拉出来

```javascript
	entry: {
    app: './src/main.ts',
    vendor: [
      "lodash"
    ]
  }

  plugins: [
    new webpack.ProvidePlugin({
      _: 'lodash'
    })
  ]
```

上面的意思是，当模块使用这些变量的时候`wepback`会自动加载

然后，你需要告诉`eslint`这个 `_` 是全局的

在`.eslintrc.js`中添加

```tsx
  globals: {
    _: true
  },
```

接下来，你还需要告诉`ts`这个 `_` 是全局的

在`vue-shim.d.ts`

```tsx
declare global {
  const _: typeof lodash
}
```

这样，在其他地方就可以用`_`直接调用啦



#### 4、配置 vuex

```
# 安装依赖
npm i vuex vuex-class --save
```

- [vuex](https://github.com/vuejs/vuex)：在 `vue` 中集中管理应用状态
- [vuex-class](https://github.com/ktsn/vuex-class) ：在 `vue-class-component` 写法中 绑定 `vuex`





### 最后

网上很多从0开始搭建的教程都是一两年之前的，细节变动也是挺多的，所有就把过程完整的记录下来了。

希望可以帮到你！

配置完整版可参考



### 参考

[vue + typescript 进阶篇](https://segmentfault.com/a/1190000011878086#articleHeader9)

[TypeScript-Vue-Starter](https://github.com/microsoft/TypeScript-Vue-Starter)



