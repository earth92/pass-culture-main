import get from 'lodash.get'
import { BasicInput, removeWhitespaces } from 'pass-culture-shared'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { formatSiren } from '../../utils/string'

class SirenInput extends Component {
  onChange = event => {
    const { type } = this.props

    event.persist()

    let value = removeWhitespaces(event.target.value)

    console.log('type', type)

    if (type === 'siret') {
      value = value.slice(0, Math.min(14, value.length))
    } else if (type === 'siren') {
      value = value.slice(0, Math.min(9, value.length))
    }

    this.props.onChange(value, {
      event,
      isSagaCalling: true,
    })
  }

  render() {
    const { errors, fetchedName, readOnly, value, withFetchedName } = this.props

    const $input = (
      <BasicInput
        {...this.props}
        onChange={this.onChange}
        type="text"
        value={formatSiren(value)}
      />
    )

    return (
      <Fragment>
        {$input}
        {fetchedName
          ? withFetchedName && (
              <span className="display-name">{fetchedName}</span>
            )
          : value &&
            !errors &&
            !readOnly && <button className="button is-loading" />}
      </Fragment>
    )
  }
}

export default connect((state, ownProps) => ({
  fetchedName: get(state, `form.${ownProps.formName}.name`),
}))(SirenInput)
