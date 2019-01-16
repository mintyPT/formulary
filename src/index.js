import React from "react";
import ReactDOM from "react-dom";
import Form from "./Form";
import withInput from "./withInput";

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
            //fieldApi.setError(e.target.value + " is not a valid value");
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

function App() {
  return (
    <div className="App">
      <Form
        initialValues={{ name: "mauro" }}
        onChange={(...etc) => console.log("onChange", ...etc)}
        onSubmit={(...etc) => console.log("onSubmit", ...etc)}
        onBlur={(...etc) => console.log("onBlur", ...etc)}
        validator={{
          name: ["required", notValidTest]
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
              <button
                type="button"
                onClick={() => formApi.setError("ages.0", "nope!")}
              >
                set error
              </button>

              <Input label="Name" field="name" />

              {formApi.getValue("ages", []).map((a, i) => {
                return <Input label="Age" field={`ages.${i}`} />;
              })}

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
