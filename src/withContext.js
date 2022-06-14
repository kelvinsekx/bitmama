import React from 'react';
import Context from './context';

const withContext = (WrappedComponent) => () =>
  (
    <>
      <Context.Consumer>
        {(context) => <WrappedComponent context={context} />}
      </Context.Consumer>
    </>
  );

export default withContext;
