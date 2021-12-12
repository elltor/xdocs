// 侧边栏配置
const sliderConfig = [
  {
    text: '首页',
    link: '/',
  },
  {
    text: 'Java 总结',
    link: '/java/',
    children: [
      '/java/java-1.md',
      '/java/java-2.md',
    ]
  },
  {
    text: 'Netty 总结',
    link: '/netty/',
    children: [
      '/netty/netty-series-1.md',
      '/netty/netty-series-2.md',
      '/netty/netty-series-3.md',
      '/netty/netty-series-4.md',
      '/netty/netty-series-5.md',
      '/netty/netty-series-6.md',
      '/netty/netty-series-7.md',
    ]
  }
]


// 系统配置
module.exports = {
  base: '/',
  home: '/',
  title: "xDocs",
  description: 'Write the code. Change the World.',
  // 默认主题配置
  themeConfig: {
    logo: '/imgs/xdocs_logo.png',
    // 最后更新时间 开启&文案
    lastUpdated: true,
    lastUpdatedText: '上次更新',
    // 贡献人 开启&文案
    contributors: true,
    contributorsText: '贡献者',
    // 每个网页的<head>的信息
    head: [
      [
        'link',
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: `/imgs/icon/favicon-16x16.png`,
        },
      ],
      [
        'link',
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: `/imgs/icon/favicon-32x32.png`,
        },
      ],
      ['link', { rel: 'manifest', href: '/site.webmanifest' }],
      ['meta', { name: 'application-name', content: 'xDocs' }],
      ['meta', { name: 'apple-mobile-web-app-title', content: 'xDocs' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },],
      ['link', { rel: 'apple-touch-icon', href: `/imgs/icon/apple-touch-icon.png` },],
    ],
    // 导航栏
    navbar: [
      { text: '首页', link: '/' },
      { text: 'My Blog', link: 'https://elltor.com' },
      { text: 'GitHub', link: 'https://github.com/elltor/xdocs' },
    ],
    // 侧边栏 显示深度&主页侧边栏
    sidebarDepth: 0,
    sidebar: sliderConfig,
    // 源码仓库
    // 如果你按照 `organization/repository` 的格式设置它，会将它作为一个 GitHub 仓库
    //repo: 'elltor/xdocs',
    //repoLabel: 'GitHub',
    // 在GitHub上编辑功能和文档源码仓库信息 
    editLink: true,
    editLinkText: '在GitHub编辑此页',
    editLinkPattern: ':repo/edit/:branch/:path', // 需要使用docsXXX信息
    docsRepo: 'https://github.com/elltor/xdocs',
    docsBranch: 'main',
    docsDir: 'docs',
  },
  // 开启的插件
  plugins: [
    ['@vuepress/plugin-search']
  ],
  // markdown配置
  markdown: {
    code: {
      lineNumbers: false
    }
  }
}
