import _ from "lodash";
import React from "react";
import withInput from './withInput'

import { Provider } from "./context";

const baseTests = {
  required: v => (!v ? "required" : false),
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: props.initialValues || props.defaultValue || {},
      errors: props.initialErrors || {},
      touched: props.initialTouched || {}
    };
  }

  triggerParentOnChange = field => {
    if (this.props.onChange) {
      this.props.onChange(this.state.values, field, this.getApi());
    }
  };

  triggerParentOnBlur = field => {
    if (this.props.onBlur) {
      this.props.onBlur(this.state.values, field, this.getApi());
    }
  };

  setValues = values => {
    this.setState({ values });
    this.triggerParentOnChange();
  };

  setValue = (field, value) => {
    let { values, touched } = this.state;
    this.setState({
      values: _.set(values, field, value),
      touched: _.set(touched, field, true)
    });
    this.triggerParentOnChange(field);
  };

  setTouched = (field, value = true) => {
    const { touched } = this.state;
    this.setState({
      touched: _.set(touched, field, value)
    });
  };

  setError = (field, error) => {
    const { errors, touched } = this.state;
    this.setState({
      errors: _.set(errors, field, error),
      touched: _.set(touched, field, true)
    });
  };

  addValue = (field, value) => {
    let { values } = this.state;
    let originalValue = _.get(values, field);
    originalValue = !originalValue ? [] : _.castArray(originalValue);
    originalValue = [...originalValue, value];
    this.setState({
      values: _.set(values, field, originalValue)
    });
    this.triggerParentOnChange(field);
  };

  removeValue = (field, index) => {
    let { values } = this.state;
    const vals = _.get(values, field);
    this.setState({
      values: _.set(values, field, [
        ..._.slice(vals, 0, index),
        ..._.slice(vals, index + 1)
      ])
    });
    this.triggerParentOnChange(field);
  };

  getTests = () => {
    return {};
  };

  getTest = name => {
    const allTests = {
      ...baseTests,
      ...this.getTests()
    };
    return allTests[name];
  };

  validate = async () => {
    const { values } = this.state;
    const { validator } = this.props;
    let errors;
    if (validator) {
      const initializedValidator = validator(values);
      const keys = _.keys(initializedValidator);
      const arrKeyAndError = await Promise.all(
        _.map(keys, async key => {
          let err;

          const value = _.get(values, key);
          const tests = initializedValidator[key];

          for (let i = 0; i < tests.length; i++) {
            let validator = tests[i];

            if (_.isString(validator)) {
              validator = this.getTest(validator);
            }

            err = await validator(value, values);
            if (err) break;
          }

          return [key, err];
        })
      );

      errors = _.chain(arrKeyAndError)
        .filter(([nada, err]) => !!err)
        .fromPairs()
        .value();

      _.mapValues(errors, (error, key) => {
        this.setError(key, error);
      });
    }

    return errors;
  };

  onChange = (field, value) => {
    this.setValue(field, value);
  };

  onBlur = field => {
    this.setTouched(field);
    this.triggerParentOnBlur(field);
  };

  clearErrors = () => {
    this.setState({ errors: {} });
  };

  onSubmit = async e => {
    e.preventDefault();
    this.clearErrors();
    const validationResult = await this.validate();
    const noErrors = _.isNil(validationResult) || _.isEmpty(validationResult);
    if (noErrors && this.props.onSubmit) {
      this.props.onSubmit(this.state.values);
    }
  };

  getValue = (key, defaultValue) => {
    return _.get(this.state.values, key, defaultValue);
  };

  getTouched = (key, defaultTouched) => {
    return _.get(this.state.touched, key, defaultTouched);
  };

  getError = (key, defaultError) => {
    return _.get(this.state.errors, key, defaultError);
  };

  getApi = () => {
    return {
      setError: this.setError,
      setValue: this.setValue,
      setValues: this.setValues,
      setTouched: this.setTouched,

      addValue: this.addValue,
      removeValue: this.removeValue,

      getError: this.getError,
      getValue: this.getValue,
      getTouched: this.getTouched,

      onBlur: this.onBlur,
      onSubmit: this.onSubmit,
      onChange: this.onChange
    };
  };

  render() {
    const { children } = this.props
    const formApi = this.getApi();
    const obj = { formState: this.state, formApi };
    const markup = _.isFunction(children) ? children(obj) : this.props.children
    return (
      <Provider value={obj}>
        <form onSubmit={(...etc) => this.onSubmit(...etc)}>
          {markup}
        </form>
      </Provider>
    );
  }
}

export default withInput(Form);
