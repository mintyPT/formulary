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
      required: v => (!v ? "required" : false),
      ...this.getTests()
    };
    return allTests[name];
  };

  validate = async () => {
    console.log("> validate");
    const { values } = this.state;
    const { validator } = this.props;
    let errors;
    if (validator) {
      const keys = _.keys(validator);
      const arrKeyAndError = await Promise.all(
        _.map(keys, async key => {
          let err;

          const value = _.get(values, key);
          const tests = validator[key];

          for (let i = 0; i < tests.length; i++) {
            let validator = tests[i];

            if (_.isString(validator)) {
              validator = this.getTest(validator);
            }

            console.log("validator", validator);

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
      console.log("after tests", errors);
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
    console.log("> onSubmit");
    e.preventDefault();
    this.clearErrors();
    const validationResult = await this.validate();
    console.log(validationResult);
    if (
      (_.isNil(validationResult) || _.isEmpty(validationResult)) &&
      this.props.onSubmit
    ) {
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
      setValues: this.setValues,
      setValue: this.setValue,
      setTouched: this.setTouched,
      setError: this.setError,
      addValue: this.addValue,
      getValue: this.getValue,
      removeValue: this.removeValue,
      getTouched: this.getTouched,
      getError: this.getError,
      onBlur: this.onBlur,
      onSubmit: this.onSubmit,
      onChange: this.onChange
    };
  };

  render() {
    const formApi = this.getApi();
    const obj = { formState: this.state, formApi };
    return (
      <Provider value={obj}>
        <form
          onSubmit={(...etc) => {
            console.log("on form submit");
            this.onSubmit(...etc);
          }}
        >
          {this.props.children(obj)}
        </form>
      </Provider>
    );
  }
}

export default Form;
