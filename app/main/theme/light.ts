import layouts from 'material-dashboard-pro-react/assets/jss/material-dashboard-pro-react/layouts'
const headerStyle:Function = require('material-dashboard-pro-react/src/assets/jss/material-dashboard-pro-react/components/headerStyle.jsx')
const menuStyle = require('material-dashboard-pro-react/src/assets/jss/material-dashboard-pro-react/components/sidebarStyle.jsx')

const styles:object = (theme:any) => {

  const hs = headerStyle(theme)
  const db = dashboardStyle(theme)
  const ms = menuStyle(theme)

  return {
    searchBar: hs.appBar,
    results: db.mainPanel,
    resultList: ms.list,
    resultItem: ms.item,
    resultText: ms.itemText,
    resultIcon: ms.itemIcon,
    resultPreview: db.content,
  }
}

export default styles
