import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import _ from "lodash";

const Context = React.createContext({});
const Provider = Context.Provider;
const Consumer = Context.Consumer;

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
    console.log("originalValue");
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

  getValue = key => {
    let { values } = this.state;
    return _.get(values, key);
  };

  getApi = () => {
    return {
      setValues: this.setValues,
      setValue: this.setValue,
      setTouched: this.setTouched,
      setError: this.setError,
      addValue: this.addValue,
      getValue: this.getValue,
      removeValue: this.removeValue
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

const WithInput = Component => {
  return class InputWrapper extends React.Component {
    setError = (error, formApi) => {
      formApi.setError(this.props.field, error);
    };
    setValue = (value, formApi) => {
      formApi.setValue(this.props.field, value);
    };
    setTouched = (touched, formApi) => {
      formApi.setTouched(this.props.field, touched);
    };

    render() {
      const { ...props } = this.props;
      return (
        <Consumer>
          {({ formState, formApi }) => {
            const fieldName = props.field;
            const { values, errors, touched } = formState;

            const value = values[fieldName];
            const touchedS = !!touched[fieldName];
            const error = errors[fieldName];

            const onChange = value => {
              formApi.setValue(fieldName, value);
            };
            const onBlur = () => {
              formApi.setTouched(props.field);
            };
            const fieldApi = {
              setError: error => this.setError(error, formApi),
              setValue: value => this.setValue(value, formApi),
              setTouched: touched => this.setTouched(touched, formApi)
            };
            return (
              <Component
                {...props}
                value={value}
                touched={touchedS}
                error={error}
                onChange={onChange}
                onBlur={onBlur}
                fieldApi={fieldApi}
              />
            );
          }}
        </Consumer>
      );
    }
  };
};

const Input = WithInput(
  ({ label, error, touched, onChange, fieldApi, ...props }) => {
    return (
      <div>
        <div>
          <small>
            {label} - {String(touched)}
          </small>
        </div>
        <input
          {...props}
          onChange={e => {
            onChange(e.target.value);
            fieldApi.setError(e.target.value + " is not a valid value");
          }}
        />
        {touched && (
          <div>
            <small style={{ color: "red" }}>{error}</small>
          </div>
        )}
      </div>
    );
  }
);

function App() {
  return (
    <div className="App">
      <Form
        initialValues={{ name: "mauro" }}
        validator={{
          name: [v => (!v ? "required" : false)]
        }}
      >
        {({ formState, formApi }) => {
          return (
            <div>
              <button
                type="button"
                onClick={() => formApi.addValue("ages", Math.random())}
              >
                add age
              </button>
              <button
                type="button"
                onClick={() => formApi.removeValue("ages", 0)}
              >
                remove age
              </button>

              <Input label="name" field="name" />
              <pre>{JSON.stringify(formState, null, 4)}</pre>
            </div>
          );
        }}
      </Form>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
