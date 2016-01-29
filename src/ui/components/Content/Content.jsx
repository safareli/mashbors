import React from 'react'
import H from '../../tools/classNameHelper'

export default class Content extends React.Component {
  static propTypes = {
    withSpacing : H.flagModifier
  }

  render() {
    var {className, ...props} = this.props
    return (
      <div className={H.toElementClasses("Content", H.pickModifiers(this), [this.props.className])} {...H.otherProps(this.constructor.propTypes,this.props)}>
        {this.props.children}
      </div>
    )
  }
}

