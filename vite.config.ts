import type { UserConfig, ConfigEnv } from 'vite'
import { loadEnv } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy';
import styleImport from 'vite-plugin-style-import';
import ViteComponents, { VantResolver } from 'vite-plugin-components'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const CWD = process.cwd()
const root: string = CWD

// 环境变量
const BASE_ENV_CONFIG = loadEnv('', CWD)
const DEV_ENV_CONFIG = loadEnv('development', CWD)
const PROD_ENV_CONFIG = loadEnv('production', CWD)

export default ({ command, mode }: ConfigEnv): UserConfig => {
  // 环境变量
  const {VITE_BASE_URL,VITE_DROP_CONSOLE,VITE_LEGACY} = loadEnv(mode, CWD)

  const isBuild = command === 'build';

  return {
    base: VITE_BASE_URL,
    esbuild: {
      // target: 'es2015'
    },
    alias: {
      '@': resolve(__dirname, './src'),
    },
    plugins: [
      vue(),
      vueJsx({
        // options are passed on to @vue/babel-plugin-jsx
      }),
      styleImport({ // 一、手动的按需导入，需手动import组件
        libs: [
          {
            libraryName: 'vant',
            esModule: true,
            resolveStyle: (name) => {
              return `vant/es/${name}/style/index`;
            },
          },
        ],
      }),
      // ViteComponents({ // 二、自动按需导入，无需声明式import引入组件
      //   // valid file extensions for components.
      //   extensions: ['vue', 'tsx'],
      //   customComponentResolvers: [VantResolver()]
      // })
      // ...(VITE_LEGACY && isBuild ? [legacy()] : [])
    ],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {},
          javascriptEnabled: true
        },
        scss: {
          additionalData: `@import "src/styles/vw-rem/_util.scss";
                       @import "src/styles/vw-rem/_border.scss";
                       @import "src/styles/func.scss";`
        }
      }
    },
    server: {
      port: 8888,
      proxy: {
        '/api': {
          // 免费的在线REST API
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    optimizeDeps: {
      include: [
        'vant',
        '@vant/touch-emulator'
      ],
    },
    build: {
      polyfillDynamicImport: VITE_LEGACY,
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: VITE_DROP_CONSOLE,
        },
      },
    }
  }
}
