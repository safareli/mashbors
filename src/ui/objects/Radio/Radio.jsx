import React from 'react'
import H from '../../tools/classNameHelper'

export default class Checkbox extends React.Component {
  static propTypes = {
  }

  render() {
    var {className, ...props} = this.props
    return (
      <input type="radio" className={H.toElementClasses("Radio", H.pickModifiers(this), [className])} {...props}/>
    )
  }
}
