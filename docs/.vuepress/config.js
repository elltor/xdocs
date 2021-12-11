module.exports = {
  base: '/',
  home: '/',
  title: "Elltor's Docs",
  description: 'Write the code. Change the World.',
  themeConfig: {
    // logo: '/avatar.png',
    // 最后更新时间 文案
    lastUpdated: true,
    lastUpdatedText: 'Last Updated',
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'My Blog', link: 'https://elltor.com/' },
    ],
    sidebar: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '第一章',
        link: '/java/java-1.md',
      },
      {
        text: '第二章',
        link: '/java/java-2.md',
      },
    ]
  },
  plugins: [
    ['@vuepress/plugin-search']
  ],
  markdown: {
    code: {
      lineNumbers: false
    }
  }
}
