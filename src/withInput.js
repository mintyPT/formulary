import React from "react";
import { Consumer } from "./Form";

const withInput = Component => {
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

            const value = formApi.getValue(fieldName);
            const touchedS = !!formApi.getTouched(fieldName);
            const error = formApi.getError(fieldName);

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

export default withInput;
