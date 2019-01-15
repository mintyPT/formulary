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
    const { values, touched } = this.state;
    values[field] = value;
    touched[field] = true;
    this.setState({ values, touched });
  };

  setTouched = (field, value = true) => {
    const { touched } = this.state;
    touched[field] = value;
    this.setState({ touched });
  };

  setError = (field, error) => {
    const { errors, touched } = this.state;
    errors[field] = error;
    touched[field] = true;
    this.setState({ errors, touched });
  };

  getApi = () => {
    return {
      setValues: this.setValues,
      setValue: this.setValue,
      setTouched: this.setTouched,
      setError: this.setError
    };
  };

  onSubmit = e => {
    e.preventDefault();
    const { validator } = this.props;
    const { values } = this.state;
    if (validator) {
      _.mapValues(validator, (tests, key) => {
        console.log(">", key, tests, values[key]);
        let err;
        for (let i = 0; i < tests.length; i++) {
          const f = tests[i];
          err = f(values[key]);
          if (err) break;
        }
        if (err) {
          this.setError(key, err);
        }
      });
    }
  };

  render() {
    const formApi = this.getApi();
    return (
      <Provider value={{ formState: this.state, formApi }}>
        <form onSubmit={this.onSubmit}>
          {this.props.children({
            formState: this.state,
            formApi
          })}
        </form>
      </Provider>
    );
  }
}

const WithInput = Component => {
  return ({ ...props }) => (
    <Consumer>
      {({ formState, formApi }) => {
        const { values, errors, touched } = formState;
        const value = values[props.field];
        const touchedS = !!touched[props.field];
        const error = errors[props.field];
        const onChange = value => {
          formApi.setValue(props.field, value);
        };
        const onBlur = () => {
          formApi.setTouched(props.field);
        };
        const fieldApi = {
          setError: error => {
            formApi.setError(props.field, error);
          },
          setValue: value => {
            formApi.setValue(props.field, value);
          },
          setTouched: touched => {
            formApi.setTouched(props.field, touched);
          }
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
                onClick={() => formApi.setError("name", "nop")}
              >
                error me
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
