import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import AddProduct from './components/addProduct';
import Cart from './components/cart';
import Login from './components/login';
import ProductList from './components/productList';

import Context from './context';
import { findItemInStore, mapAttributeToData } from './utils';
import axios from 'axios';

const { Provider } = Context;
export default function App() {
  const [state, setState] = useState({
    user: null,
    cart: {},
    products: [],
  });
  const navigate = useNavigate();

  useEffect(function onComponentMount() {
    console.log('h');
    const initializeLogin = async () => {
      let user = localStorage.getItem('user');
      let cart = localStorage.getItem('cart');
      const products = await axios.get(
        'http://localhost:1337/api/shops',
      );

      user = user ? JSON.parse(user) : null;
      cart = cart ? JSON.parse(cart) : {};
      setState((previousState) => ({
        ...previousState,
        user,
        products: mapAttributeToData(products.data.data),
        cart,
      }));
    };
    initializeLogin();
  }, []);

  const addProduct = (product) => {
    let products = state.products.slice();
    products.push(product);
    setState({ ...state, products });
    return product;
  };

  const login = async (email, password) => {
    const res = await axios
      .post('http://localhost:1337/api/auth/local', {
        identifier: email,
        password,
      })
      .catch((e) => e);

    if (res.status === 200) {
      const user = {
        email: res.data.email,
        token: res.data.jwt,
        accessLevel: email ? 0 : 1,
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
    const { cart, products } = { ...state };
    const { name, amount } = cartItem;

    if (cart[name]) {
      const itemInState = findItemInStore(state)(cartItem.product.id);
      cart[name].amount += amount;
      cart[name].product.stock++;
      products[itemInState].stock--;
    } else {
      cart[name] = cartItem;
    }

    if (cart[name].amount > cart[name].product.stock) {
      cart[name].amount = cart[name].product.stock;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setState({ ...state, cart });
  };

  const clearCart = () => {
    let cart = {};
    localStorage.removeItem('cart');
    setState({ ...state, cart });
  };

  const checkout = () => {
    if (!state.user) {
      navigate('/login');
    }
    const jwt = JSON.parse(localStorage.getItem('user')).token;
    const cart = state.cart;

    const products = state.products.map((p) => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;

        axios.put(
          `http://localhost:1337/api/shops/${p.id}`,
          {
            data: {
              ...p,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        );
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
