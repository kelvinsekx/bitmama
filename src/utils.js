import * as yup from 'yup';

export const findItemInStore = (store) => (id) =>
  store.products.findIndex((e) => e.id === id);

export const addProductSchema = yup
  .object({
    name: yup.string().required(),
    price: yup.string().required(),
    stock: yup.string().required(),
    shortDesc: yup.string().required(),
    description: yup.string().required(),
  })
  .required();

export const loginSchema = yup
  .object({
    email: yup.string().email("email isn't valid").required(),
    password: yup.string().required(),
  })
  .required();

export const getRandomId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const mapAttributeToData = (data) =>
  data.map((e) => ({ id: e.id, ...e.attributes }));

export const increment = (f) => f;
