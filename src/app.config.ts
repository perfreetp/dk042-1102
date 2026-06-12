export default defineAppConfig({
  pages: [
    'pages/lobby/index',
    'pages/create/index',
    'pages/tasks/index',
    'pages/mine/index',
    'pages/safety/index',
    'pages/detail/index',
    'pages/mood/index',
    'pages/report/index',
    'pages/followup/index',
    'pages/favorites/index',
    'pages/history/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '烦恼交换',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F5FF'
  },
  tabBar: {
    color: '#9A9AB0',
    selectedColor: '#7C6FE6',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/lobby/index',
        text: '大厅'
      },
      {
        pagePath: 'pages/create/index',
        text: '写烦恼'
      },
      {
        pagePath: 'pages/tasks/index',
        text: '回应'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      },
      {
        pagePath: 'pages/safety/index',
        text: '安全'
      }
    ]
  }
})
