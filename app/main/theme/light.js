import headerStyle
  from 'material-dashboard-pro-react/src/assets/jss/material-dashboard-pro-react/components/headerStyle'
import dashboardStyle
  from 'material-dashboard-pro-react/src/assets/jss/material-dashboard-pro-react/layouts/dashboardStyle'
import sidebarStyle
  from 'material-dashboard-pro-react/src/assets/jss/material-dashboard-pro-react/components/sidebarStyle'
import inputStyle
  from 'material-dashboard-pro-react/src/assets/jss/material-dashboard-pro-react/components/customInputStyle'

const styles = (theme) => {
  const hs = headerStyle(theme)
  const db = dashboardStyle(theme)
  const ms = sidebarStyle(theme)

  return {
    searchBar: {
      ...hs.appBar,
      position: 'relative',
    },
    searchInput: {
      ...inputStyle,
      width: '100%',
    },
    results: db.mainPanel,
    resultList: ms.list,
    resultItem: ms.item,
    resultText: ms.itemText,
    resultIcon: ms.itemIcon,
    resultPreview: db.content,
  }
}

export default styles
