import classnames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'

import Header from './Header'
import Icon from './Icon'
import { closeNotification } from '../../reducers/notification'

const PageWrapper = props => {
  const {
    backTo,
    closeNotification,
    header,
    Tag,
    name,
    redBg,
    noContainer,
    noHeader,
    noPadding,
    children,
    loading,
    notification,
    whiteHeader
  } = props
  const footer = [].concat(children).find(e => e && e.type === 'footer')
  const content = []
    .concat(children)
    .filter(e => e && e.type !== 'header' && e.type !== 'footer')
  return [
// <<<<<<< HEAD
//     whiteHeader && <Header key='header' whiteHeader/>,
//     !noHeader && !whiteHeader && <Header key='header' {...header} />,
// =======
    whiteHeader
      ? <Header key='header' whiteHeader/>
      : !noHeader && <Header key='header' {...header} />,
// >>>>>>> b2cf002794bbaa21ab6316099ad4fef6c11b663d
    <Tag
      className={classnames({
        page: true,
        [`${name}-page`]: true,
        'with-header': Boolean(header),
        'with-footer': Boolean(footer),
        'red-bg': redBg,
        'no-padding': noPadding,
        container: !noContainer,
        loading,
      })}
      key='page-wrapper'
    >
      <div className={classnames('page-content')}>
        {notification && (
          <div className={`notification is-${notification.type || 'info'}`}>
            <button className="delete" onClick={closeNotification}>
              Ok
            </button>
            {notification.text}
          </div>
        )}
        {backTo && (
          <NavLink to={backTo.path} className='back-button has-text-primary'>
            <Icon svg='ico-back' />{` ${backTo.label}`}
          </NavLink>
        )}
        {content}
      </div>
      {footer}
    </Tag>
  ]
}

PageWrapper.defaultProps = {
  Tag: 'main',
}

export default connect(
  state => ({ notification: state.notification }),
  { closeNotification }
)(PageWrapper)
