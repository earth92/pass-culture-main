import React, {Component} from 'react'
import PropTypes from 'prop-types';
import classnames from 'classnames'
import Icon from './Icon'

class Field extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  static defaultProps = {
    layout: 'horizontal',
    size: 'normal',
    displayValue: v => (v || ''),
    storeValue: v => v,
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
  }

  static getDerivedStateFromProps(newProps, currentState) {
    return Object.assign({
      value: newProps.value || currentState.value
    })
  }

  componentDidMount() {
    this.props.value && this.onChange(this.props.value)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.onChange(this.props.value)
    }
  }

  onChange = (value) => {
    // if (value === this.props.value) return

    const displayValue = this.props.InputComponent.displayValue || this.props.displayValue
    const storeValue = this.props.InputComponent.storeValue || this.props.storeValue

    this.setState({
      value: displayValue(value),
    })
    this.props.onChange(storeValue(value))
  }

  renderInput = () => {

    const inputProps = Object.assign({}, this.props, {
      'aria-describedby': `${this.props.id}-error`,
      onChange: this.onChange,
      required: this.props.required && !this.props.readonly,
      value: this.state.value,
    })

    const InputComponent = this.props.InputComponent

    return <InputComponent {...inputProps} className={`input is-${this.props.size}`} />
  }

  renderLayout() {
    const {
      errors,
      id,
      isExpanded,
      label,
      layout,
      required,
      readOnly,
      size,
      type,
    } = this.props
    const $input = this.renderInput()

    if (type === 'hidden') return $input
    switch(layout) {
      case 'horizontal':
        return <div className='field is-horizontal'>
          {label && <div className={`field-label is-${size}`}>
            <label htmlFor={id} className='label'><span className={`subtitle ${classnames({required, readOnly})}`}>{label} :</span></label>
          </div>}
          <div className='field-body'>
            <div className={`field ${classnames({'is-expanded': isExpanded})}`}>
              {$input}
            </div>
            {errors.map((e, i) => <p className='help is-danger' id={`${id}-error`} key={i}>
              <Icon svg="picto-warning" alt="Warning" /> {e}
            </p>)}
          </div>
        </div>
      case 'sign-in-up':
        if (type === 'checkbox') {
          return <div className='field checkbox'>{$input}</div>
        } else {
          const {sublabel} = this.props
          return <div className="field">
            {label && <label className='label' htmlFor={id}>
              <h3 className={classnames({required, 'with-subtitle': sublabel})}>{label}</h3>
              {sublabel && <p>... {sublabel} :</p>}
            </label>}
            <div className="control">
              {$input}
            </div>
            <ul className="help is-danger" id={`${id}-error`}>
              {errors.map((e, i) => <li key={i}><Icon svg="picto-warning" alt="Warning" /> {e}</li>)}
            </ul>
          </div>
        }
      default:
        break
    }
    return $input
  }

  render() {
    return this.renderLayout()
  }
}

export default Field
