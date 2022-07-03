import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import context from '../context';

import { useForm } from 'react-hook-form';
import { loginSchema as schema } from './../utils';
import { yupResolver } from '@hookform/resolvers/yup';

import { Error } from './error';

const Login = () => {
  const [state, setState] = useState({});
  const { user, login } = useContext(context);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const _login = (data) => {
    const { email, password } = data;

    login(email, password).then((loggedIn) => {
      if (!loggedIn) {
        setState({ error: 'Invalid Credentails' });
      }
    });
  };

  return !user ? (
    <>
      <div className="hero is-primary ">
        <div className="hero-body container">
          <h4 className="title">Login</h4>
        </div>
      </div>
      <br />
      <br />
      <form onSubmit={handleSubmit(_login)}>
        <div className="columns is-mobile is-centered">
          <div className="column is-one-third">
            <div className="field">
              <label className="label">Email: </label>
              <input
                className="input"
                type="email"
                {...register('email')}
              />
              <Error error={errors.email} />
            </div>
            <div className="field">
              <label className="label">Password: </label>
              <input
                className="input"
                type="password"
                {...register('password')}
              />
              <Error error={errors.password} />
            </div>
            {state.error && (
              <div className="has-text-danger">{state.error}</div>
            )}
            <div className="field is-clearfix">
              <button className="button is-primary is-outlined is-pulled-right">
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  ) : (
    <Navigate to="/products" />
  );
};

export default Login;
