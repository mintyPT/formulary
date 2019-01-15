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
      values: { name: "msa" },
      errors: { name: "msa is not valid" }
    };
  }
  setValues(values) {
    this.setState({ values });
  }
  render() {
    const formApi = {};
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
        const { values, errors } = formState;
        console.log("formApi", formApi);
        const value = values[props.field];
        const error = errors[props.field];
        return <Component {...props} value={value} error={error} />;
      }}
    </Consumer>
  );
};

const Input = WithInput(({ label, error, ...props }) => {
  return (
    <div>
      <div>
        <small>{label}</small>
      </div>
      <input {...props} />
      <div>
        <small style={{ color: "red" }}>{error}</small>
      </div>
    </div>
  );
});

function App() {
  return (
    <div className="App">
      <Form>
        {() => {
          return <Input label="name" field="name" value={"msa"} />;
        }}
      </Form>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
