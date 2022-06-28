import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import AddProduct from './components/addProduct';
import Cart from './components/cart';
import Login from './components/login';
import ProductList from './components/productList';

import Context from './context';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

const { Provider } = Context;
export default function App() {
  const [state, setState] = useState({
    user: null,
    cart: {},
    products: [],
  });
  const navigate = useNavigate();

  useEffect(function componentMount() {
    const initializeLogin = async () => {
      // get the user and products
      let user = localStorage.getItem('user');
      let cart = localStorage.getItem('cart');
      const products = await axios.get(
        'http://localhost:3001/products',
      );

      user = user ? JSON.parse(user) : null;
      cart = cart ? JSON.parse(cart) : {};
      setState({
        ...state,
        user,
        products: products.data,
        cart,
      });
    };
    initializeLogin();
  }, []);

  // utility functions
  const findUpdatedStock = (id) =>
    state.products.findIndex((e) => e.id === id);

  const addProduct = (product, callback) => {
    // rewrite --1
    let products = state.products.slice();
    products.push(product);
    // end r--
    setState({ products }, () => callback && callback());
  };

  const login = async (email, password) => {
    const res = await axios
      .post('http://localhost:3001/login', { email: email, password })
      .catch((res) => ({
        status: 401,
        message: 'Unauthorized',
        err: res,
      }));

    if (res.status === 200) {
      const { email } = jwt_decode(res.data.accessToken);
      const user = {
        email,
        token: res.data.accessToken,
        accessLevel: email === 'admin@example.com' ? 0 : 1,
      };

      setState({ ...state, user });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  };

  const logout = (e) => {
    e.preventDefault();
    setState({ ...state, user: null });
    localStorage.removeItem('user');
    return navigate('/login');
  };

  const addToCart = (cartItem) => {
    const clonedState = { ...state };
    const { cart } = clonedState;
    if (cart[cartItem.name]) {
      const updatedProductIndex = findUpdatedStock(
        cartItem.product.id,
      );
      cart[cartItem.name].amount += cartItem.amount;
      cart[cartItem.name].product.stock++;
      clonedState.products[updatedProductIndex].stock--;
    } else {
      cart[cartItem.name] = cartItem;
    }

    if (
      cart[cartItem.name].amount > cart[cartItem.name].product.stock
    ) {
      cart[cartItem.name].amount = cart[cartItem.name].product.stock;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setState({ ...clonedState, cart });
  };

  const checkout = () => {
    if (!state.user) {
      navigate('/login');
    }

    const cart = state.cart;

    const products = state.products.map((p) => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;

        axios.put(`http://localhost:3001/products/${p.id}`, { ...p });
      }
      return p;
    });

    setState({ ...state, products });
    setTimeout(clearCart, 2000);
  };

  const removeFromCart = (cartItemId) => {
    let cart = state.cart;
    delete cart[cartItemId];
    localStorage.setItem('cart', JSON.stringify(cart));
    setState({ ...state, cart });
    return cartItemId;
  };

  const clearCart = () => {
    let cart = {};
    localStorage.removeItem('cart');
    setState({ ...state, cart });
  };

  return (
    <Provider
      value={{
        ...state,
        removeFromCart,
        addToCart,
        login,
        addProduct,
        clearCart,
        checkout,
      }}
    >
      <div className="App">
        <nav
          className="navbar container"
          role="navigation"
          aria-label="main navigation"
        >
          <div className="navbar-brand">
            <b className="navbar-item is-size-4 ">ecommerce</b>
            <label
              role="button"
              className="navbar-burger burger"
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarBasicExample"
              onClick={(e) => {
                e.preventDefault();
                setState({ ...state, showMenu: !state.showMenu });
              }}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </label>
          </div>
          <div
            className={`navbar-menu ${
              state.showMenu ? 'is-active' : ''
            }`}
          >
            <Link to="/products" className="navbar-item">
              Products
            </Link>
            {state.user && state.user.accessLevel < 1 && (
              <Link to="/add-product" className="navbar-item">
                Add Product
              </Link>
            )}
            <Link to="/cart" className="navbar-item">
              Cart
              <span
                className="tag is-primary"
                style={{ marginLeft: '5px' }}
              >
                {Object.keys(state.cart).length}
              </span>
            </Link>
            {!state.user ? (
              <Link to="/login" className="navbar-item">
                Login
              </Link>
            ) : (
              <Link to="/" onClick={logout} className="navbar-item">
                Logout
              </Link>
            )}
          </div>
        </nav>
        <Routes>
          <Route exact path="/" element={<ProductList />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/cart" element={<Cart />} />
          <Route exact path="/add-product" element={<AddProduct />} />
          <Route exact path="/products" element={<ProductList />} />
        </Routes>
      </div>
    </Provider>
  );
}
