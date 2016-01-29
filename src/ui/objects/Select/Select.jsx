import React from 'react'
import H from '../../tools/classNameHelper'

export default class Input extends React.Component {
  static propTypes = {
    theme: H.variantModifiers(['Dark', 'Light', 'Brand'])
  }

  render() {
    var {innerClassName,icon,className,children, ...props} = this.props
    return (
      <div className={H.toElementClasses("Select", H.pickModifiers(this), [className])} {...props}>
        <select className={`Select-select ${innerClassName?innerClassName:''}`}>
          {children}
        </select>
        {icon && (
          <div className="Select-icon">
            {icon}
          </div>
        )}
      </div>

    )
  }
}
