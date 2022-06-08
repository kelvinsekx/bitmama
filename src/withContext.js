import React from 'react';
import Context from './context';

const withContext = (WrappedComponent) => {
  const withHoc = (props) => {
    return (
      <Context.Consumer>
        {(context) => (
          <WrappedComponent {...props} context={context} />
        )}
      </Context.Consumer>
    );
  };

  return withHoc;
};

export default withContext;
