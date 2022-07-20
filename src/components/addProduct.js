import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import Context from './../context';
import axios from 'axios';

import { addProductSchema as schema } from './../utils';
import { Error } from './error';
import { mapAttributeToData } from './../utils';

const AddProduct = () => {
  const { addProduct, user } = useContext(Context);
  const [state, setState] = useState({
    resetForm: false,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      price: '',
      stock: '',
      shortDesc: '',
      description: '',
    },
  });

  useEffect(() => {
    reset();
  }, [reset, state.resetForm]);

  const save = async ({
    name,
    price,
    stock,
    shortDesc,
    description,
  }) => {
    if (name && price) {
      const jwt = JSON.parse(localStorage.getItem('user')).token;
      await axios
        .post(
          'http://localhost:1337/api/shops',
          {
            data: {
              name,
              price,
              stock,
              shortDesc,
              description,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        )
        .then((res) => mapAttributeToData([res.data.data]))
        .then((data) => data.map((e) => addProduct(e)));

      setState({
        resetForm: true,
        flash: {
          status: 'is-success',
          msg: 'Product created successfully',
        },
      });
    } else {
      setState({
        flash: {
          status: 'is-danger',
          msg: 'Please enter name and price',
        },
      });
    }
  };

  return !(user && user.accessLevel < 1) ? (
    <Navigate to="/" />
  ) : (
    <>
      <div className="hero is-primary ">
        <div className="hero-body container">
          <h4 className="title">Add Product</h4>
        </div>
      </div>
      <br />
      <br />
      <form onSubmit={handleSubmit((data) => save(data))}>
        <div className="columns is-mobile is-centered">
          <div className="column is-one-third">
            <div className="field">
              <label className="label">Product Name: </label>
              <input
                className="input"
                type="text"
                {...register('name')}
              />
              <Error error={errors.name} />
            </div>

            <div className="field">
              <label className="label">Price: </label>
              <input
                className="input"
                type="number"
                {...register('price')}
              />
              <Error error={errors.price} />
            </div>

            <div className="field">
              <label className="label">Available in Stock: </label>
              <input
                className="input"
                type="number"
                {...register('stock')}
              />
              <Error error={errors.stock} />
            </div>

            <div className="field">
              <label className="label">Short Description: </label>
              <input
                className="input"
                type="text"
                {...register('shortDesc')}
              />
              <Error error={errors.shortDesc} />
            </div>

            <div className="field">
              <label className="label">Description: </label>
              <textarea
                className="textarea"
                type="text"
                rows="2"
                style={{ resize: 'none' }}
                {...register('description')}
              />
              <Error error={errors.description} />
            </div>

            {state.flash && (
              <div className={`notification ${state.flash.status}`}>
                {state.flash.msg}
              </div>
            )}
            <div className="field is-clearfix">
              <button
                className="button is-primary is-outlined is-pulled-right"
                type="submit"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddProduct;
