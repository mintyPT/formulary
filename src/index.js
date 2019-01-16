import React from "react";
import ReactDOM from "react-dom";
import Form from "./Form";
import withInput from "./withInput";

const Input = withInput(
  ({ value, label, error, touched, onChange, fieldApi, ...props }) => {
    return (
      <div>
        <div>
          <small>
            {label} - {String(touched)}
          </small>
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

const isRequiredTest = v => (!v ? "required" : false);
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
        onChange={() => console.log("onChange")}
        onSubmit={data => console.log("onSubmit", data)}
        onBlur={() => console.log("onBlur")}
        validator={{
          name: [isRequiredTest, notValidTest]
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

              {formApi.getValue("ages", []).map((a, i) => {
                return <Input label="age" field={`ages.${i}`} />;
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
