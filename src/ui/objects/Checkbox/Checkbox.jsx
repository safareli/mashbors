import React from 'react'
import H from '../../tools/classNameHelper'

export default class Checkbox extends React.Component {
  static propTypes = {
  }

  render() {
    var {className, ...props} = this.props
    return (
      <input type="checkbox" className={H.toElementClasses("Checkbox", H.pickModifiers(this), [className])} {...props}/>
    )
  }
}
