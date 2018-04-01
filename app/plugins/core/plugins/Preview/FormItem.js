import React from 'react'
import PropTypes from 'prop-types'

import Select from 'material-ui/Select'
import Input from 'material-ui/Input'
import Checkbox from 'material-ui/Checkbox'

const components = {
  bool: Checkbox,
  option: Select,
}

const FormItem = ({ type, ...props }) => {
  const Component = components[type] || Input

  return (
    <Component type={type} {...props} />
  )
}

FormItem.propTypes = {
  value: PropTypes.any,
  type: PropTypes.string.isRequired,
}

export default FormItem
