import React from "react";
import ReactDOM from "react-dom";
import Form from "./Form";
import withInput from "./withInput";

class NewForm extends Form {
  getTests = () => {
    return {
      isAdult: age => (age >= 18 ? false : "isAdult")
    };
  };
}

const Input = withInput(
  ({ value, label, error, touched, onChange, fieldApi, ...props }) => {
    return (
      <div>
        <div>
          <small>{label}</small>
        </div>
        <input
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

const notValidTest = v =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(false);
      return resolve("not valid");
    }, 1000);
  });

class FormWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  onSubmit = (...etc) => {
    console.log("onSubmit", ...etc);
    console.log(this.ref.current);
    // this.ref.current.setError("name", "error in here");
  };

  render() {
    return (
      <NewForm
        ref={this.ref}
        initialValues={{ name: "mauro" }}
        onChange={(...etc) => console.log("onChange", ...etc)}
        onSubmit={this.onSubmit}
        onBlur={(...etc) => console.log("onBlur", ...etc)}
        validator={values => ({
          name: ["required" /*, notValidTest*/]
          //"ages.0.age": ["required", "isAdult"]
        })}
      >
        {({ formState, formApi }) => {
          return (
            <div>
              <button
                type="button"
                onClick={() =>
                  formApi.addValue("ages", { id: Math.random(), age: null })
                }
              >
                add age
              </button>
              <button
                type="button"
                onClick={() => formApi.removeValue("ages", 0)}
              >
                remove age
              </button>
              <button
                type="button"
                onClick={() => formApi.setError("ages.0", "nope!")}
              >
                set error
              </button>
              <button type="submit">submit</button>
              formApi
              <Input label="Name" field="name" />
              {formApi.getValue("ages", []).map((a, i) => {
                return <Input key={a.id} label="Age" field={`ages.${i}.age`} />;
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
