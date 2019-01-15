import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";

const Context = React.createContext({});
const Provider = Context.Provider;
const Consumer = Context.Consumer;

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: props.initialValues || {},
      errors: { name: "msa is not valid" },
      touched: {}
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
    const { errors } = this.state;
    errors[field] = error;
    this.setState({ errors });
  };

  getApi = () => {
    return {
      setValues: this.setValues,
      setValue: this.setValue,
      setTouched: this.setTouched,
      setError: this.setError
    };
  };

  render() {
    const formApi = this.getApi();
    return (
      <Provider value={{ formState: this.state, formApi }}>
        {this.props.children({
          formState: this.state,
          formApi
        })}
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
        const fieldApi = {};
        return (
          <Component
            {...props}
            value={value}
            touched={touchedS}
            error={error}
            onChange={onChange}
            onBlur={onBlur}
          />
        );
      }}
    </Consumer>
  );
};

const Input = WithInput(({ label, error, touched, onChange, ...props }) => {
  return (
    <div>
      <div>
        <small>
          {label} - {String(touched)}
        </small>
      </div>
      <input {...props} onChange={e => onChange(e.target.value)} />
      <div>
        <small style={{ color: "red" }}>{error}</small>
      </div>
    </div>
  );
});

function App() {
  return (
    <div className="App">
      <Form initialValues={{ name: "mauro" }}>
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
