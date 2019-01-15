import _ from "lodash";
import React from "react";

export const Context = React.createContext({});
export const Provider = Context.Provider;
export const Consumer = Context.Consumer;

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: props.initialValues || {},
      errors: props.initialErrors || {},
      touched: props.initialTouched || {}
    };
  }

  setValues = values => {
    this.setState({ values });
  };

  setValue = (field, value) => {
    let { values, touched } = this.state;
    this.setState({
      values: _.set(values, field, value),
      touched: _.set(touched, field, true)
    });
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

  addValue = (key, value) => {
    let { values } = this.state;
    let originalValue = _.get(values, key);
    originalValue = !originalValue ? [] : _.castArray(originalValue);
    originalValue = [...originalValue, value];
    this.setState({
      values: _.set(values, key, originalValue)
    });
  };

  removeValue = (key, index) => {
    let { values } = this.state;
    const path = key + "." + index;
    const vals = _.get(values, key);
    this.setState({
      values: _.set(values, key, [
        ..._.slice(vals, 0, index),
        ..._.slice(vals, index + 1)
      ])
    });
  };

  onSubmit = e => {
    e.preventDefault();
    const { validator } = this.props;
    const { values } = this.state;
    if (validator) {
      _.mapValues(validator, (tests, key) => {
        console.log(">", key, tests, _.get(values, key));
        let err;
        for (let i = 0; i < tests.length; i++) {
          const f = tests[i];
          err = f(_.get(values, key));
          if (err) break;
        }
        if (err) {
          this.setError(key, err);
        }
      });
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
      setValues: this.setValues,
      setValue: this.setValue,
      setTouched: this.setTouched,
      setError: this.setError,
      addValue: this.addValue,
      getValue: this.getValue,
      removeValue: this.removeValue,
      getTouched: this.getTouched,
      getError: this.getError
    };
  };

  render() {
    const formApi = this.getApi();
    const obj = { formState: this.state, formApi };
    return (
      <Provider value={obj}>
        <form onSubmit={this.onSubmit}>{this.props.children(obj)}</form>
      </Provider>
    );
  }
}

export default Form;
