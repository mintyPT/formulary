import React from "react";
import { Consumer } from "./context";

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
      const { field, ...props } = this.props;

      if(!field){
        return <Component {...this.props}/>
      }

      return (
        <Consumer>
          {({ formState, formApi }) => {

            const value = formApi.getValue(field);
            const touched = !!formApi.getTouched(field);
            const error = formApi.getError(field);

            const onChange = value => formApi.onChange(field, value);
            const onBlur = () => formApi.onBlur(field);
        
            const fieldApi = {
              setError: value => this.setError(value, formApi),
              setValue: value => this.setValue(value, formApi),
              setTouched: value => this.setTouched(value, formApi)
            };

            return (
              <Component
                {...props}
                defaultValue={value}
                touched={touched}
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
