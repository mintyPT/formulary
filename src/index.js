import React from "react";
import ReactDOM from "react-dom";
import withInput from "./lib/withInput";
import Form from "./lib/Form";
import _ from 'lodash';

class NewForm extends Form {
  getTests = () => {
    return {
      isRed: color => (color !== 'red' ? false : "This is not red!")
    };
  };
}

const Input = withInput(
  ({ value, label, error, touched, onChange, fieldApi, ...props }) => {
    return (
      <div
        style={{
          border: "1px solid #c2c2c2",
          margin: "20px 0 20px",
          padding: "5px"
        }}
      >
        <div>
          <small style={{ color: touched && error ? "red" : "black" }}>
            {label}
          </small>
        </div>
        <input
          style={{
            border: touched && error ? "1px solid red" : "1px solid black"
          }}
          {...props}
          value={value}
          onChange={e => {
            onChange(e.target.value);
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

/**
 * Example of an async test
 * @param {any} v value to test
 */
// eslint-disable-next-line
const notValidTest = v =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve("not valid");
    }, 1000);
  });

class FormWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  onSubmit = (...etc) => {
    console.log("onSubmit", this.state);
    // this.ref.current.setError("name", "error in here");
  };

  render() {
    return (
      <NewForm
        ref={this.ref}
        initialValues={{ name: "mauro", user: { name: 'silva' } }}
        onChange={(...etc) => console.log("onChange", ...etc)}
        onSubmit={this.onSubmit}
        onBlur={(...etc) => console.log("onBlur", ...etc)}
        validator={values => {
          const numberOfColors = _.get(values, 'colors', []).length
          const c = Array(numberOfColors).map((v, i) => i)
          console.log(`c -->`, c)
          return {
            name: ["required" /*, notValidTest*/]
            //"colors.0.color": ["required", "isRed"]
          }
        }}
      >
        {({ formState, formApi }) => {
          return (
            <div>
              <button type="button" onClick={() => formApi.addValue("colors", { id: Math.random(), color: null })} >Add color</button>
              <button type="button" onClick={() => formApi.removeValue("colors", 0)}>Remove 1st color</button>
              <button type="button" onClick={() => formApi.setError("colors.0", "nope!")} >Set 1st error</button>
              <button type="submit">submit</button>

              <Input label="Name" field="name" />

              <NewForm field="user2" validator={values =>  ({name: ["required" /*, notValidTest*/]})}>
                <Input label="Name" field="name" />
              </NewForm>

              {formApi.getValue("colors", []).map((a, i) => {
                return <Input key={a.id} label="Color" field={`colors.${i}.color`} />;
              })}
              <pre>{JSON.stringify(formState, null, 4)}</pre>
            </div>
          );
        }}
      </NewForm>
    );
  }
}

function App() {
  return (
    <div className="App">
      <FormWrapper />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
