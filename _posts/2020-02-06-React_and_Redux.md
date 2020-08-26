---
layout: post
title: React and Redux
date: 2020-02-06
tags: ['JavaScript', 'Node.js', React, Redux]
---

React on it's own is a fairly strightforward library to use once you understand the basics of components and state. What becomes challenging is using global authentication and global state.

I decided to make a full stack MERN applicaiton to learng how to implement Redux in a realistic scenario. MERN breaks down into: MongoDB, Express.js, React and Node.js.

In essence, Redux was used to create a globally accessible store which would contain high-level state for things such as authentication.

### Retrospective

This project was done at a time when I first started learing about [React Hooks](https://reactjs.org/docs/hooks-intro.html), therefore I decided to stick with the then-familar class components and methods.

If I were to redo this now, I would almost exclusively rely on Hooks and functional components which would possibly simplify some of the logic and maybe eliminate the need for Redux. I would employ things like `useReducer`, `useEffect`, `useState` and `useCallback` or `useMemo`.

---

## Project Structure

I broke down the project into two distict parts:

- A back end server
- A front end client

This is also how the Git repositories are structured. The main reason behind this is to allow the Node.js dependencies to remain isolated and simplify any troubleshoting to resolve breaking changes down the line.

The GitHub repos can be found here:

- [Express.js REST API Server (back-end)](https://github.com/sbhaseen/mern-item-list-backend)
- [React client (front-end)](https://github.com/sbhaseen/mern-item-list-frontend)

## Express.js REST API Server

I started with the server development first, as I find it best to structure my data so that it is well defined for client-side fetching.

The data I want to save consisted of Items for the To Do list and then Users who would have access to edit the items.

This resulted in the creation of Mongoose models as interfaces to the MongoDB instance.

`Items` is quite simple:

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  description: { type: String, required: true },
  responsible: { type: String },
  priority: { type: String },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Item', ItemSchema);
```

`Users` is a bit more involved becuase I decided to add helper methods to encrypt the passwords while saving.

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { hashHelper, compareHelper } = require('../utilities/bcrypt-helper');

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Important: Must await hash result before assignment or else plain text is saved
  const hashedPassword = await hashHelper(this.password);
  this.password = hashedPassword;
});

UserSchema.methods.verifyPassword = function (inputPassword) {
  return compareHelper(inputPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

The helper functions invoke `bcrypt.hash()` and `bcrypt.compare()`, where `.hash()` also calls the `bcrytp.genSalt()` method.

More details can be found in the self-documented JSDoc format within the GitHub repo.

Finally, to access the endpoints which could perform database operations, threee distinct paths were chosen:

- Auth: `/api/auth`

  - This endpoint handles login and verification of existing users.

- Users: `/api/users`

  - This endpoint handles the creating a new user. It uses the data model of User.js.

- Items: `/api/items`

  - This endpoint handles creating, reading, updating and deleting Items in a collection. It uses the data model of Item.js.

  - Pagination (custom middleware function):

    - Pagination is used to limit a potential response delay and very large data set by serving only small chunks of Item data at a time.

    - The optional URL parameters are page and limit, where page is the current page to be views and limit is the maximum number of items shown on a page.

    - Example: `https://localhost:5000/api/items?page=2&limit=10`

    - Default values are:

    ```
    page = 1;
    limit = 5;
    ```

    - Returns pagination navigation information:
      - `next` for next page
      - `previous` for previous page
      - `total` an object containing the total items and total pages for the data set

I started with naive testing in Postman to verify things were wired correctly, then moved to write a few small model and endpoint tests using Jest.

I might do a seperate write up on testing at a later time as it would make this post far too long.

## React Client

On the front end, the major work was implementing the Redux `actions`, `reducers` and `store`.

The Axios library was used to query API endpoints as it simplified some of the logic compared to the built-in fetch method.

Actions perfrom an actions such as GET, PUT, DELETE, etc. and dispatch a "signal" function to a reducer that will typically contain the action type and payload.

The reducer then acts on the action type and sets the state in the store according to the payload data.

It would be too long to list all the action methods here, but I'll show the basic `action types`, the `item actions` and the associated `item reducer`. The rest can be found in the `src/redux/actions` folder, with JSDoc comments.

Actions Types:

```js
export const GET_ITEMS = 'GET_ITEMS';
export const ADD_ITEM = 'ADD_ITEM';
export const ADD_ITEM_PRELOAD = 'ADD_ITEM_PRELOAD';
export const DELETE_ITEM = 'DELETE_ITEM';
export const ITEMS_LOADING = 'ITEMS_LOADING';
export const ITEMS_ERROR = 'ITEMS_ERROR';

export const USER_LOADING = 'USER_LOADING';
export const USER_LOADED = 'USER_LOADED';

export const AUTH_ERROR = 'AUTH_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';

export const GET_ERRORS = 'GET_ERRORS';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

export const GET_NEXT_PAGE = 'GET_NEXT_PAGE';
export const GET_PREV_PAGE = 'GET_PREV_PAGE';
export const SET_PAGE_ITEM_LIMIT = 'SET_PAGE_ITEM_LIMIT';
```

Item Actions (queries the `/api/items/` endpoints):

```js
import axios from 'axios';
import {
  GET_ITEMS,
  ITEMS_LOADING,
  ADD_ITEM,
  ADD_ITEM_PRELOAD,
  DELETE_ITEM,
  ITEMS_ERROR,
} from './actionTypes';
import { returnErrors } from './errorActions';
import { headerConfig } from './authActions';
import api from '../../api';

/**
 * Handle fetching item data from the api.
 */
export function getItems(fetchPage, fetchLimit) {
  return (dispatch) => {
    let params = new URLSearchParams();
    params.append('page', fetchPage);
    params.append('limit', fetchLimit);

    const getUrl = api.getAllItems + params;

    dispatch(setItemsLoading());

    return axios
      .get(getUrl)
      .then((res) =>
        dispatch({
          type: GET_ITEMS,
          payload: res.data,
        })
      )
      .catch((err) => {
        dispatch(returnErrors(err));
        dispatch({ type: ITEMS_ERROR });
      });
  };
}

/**
 * A helper function to set a loading status.
 * Can be used for loading animations.
 */
export function setItemsLoading() {
  return {
    type: ITEMS_LOADING,
  };
}

/**
 * A helper funciton to ensure added item status always starts falsy.
 */
export function setAddedItemsFalse() {
  return {
    type: ADD_ITEM_PRELOAD,
  };
}

/**
 * Handle the addition of a new item.
 * @param {Object} item - The data of a new item.
 */
export function addItem(item) {
  return (dispatch, getState) => {
    const postUrl = api.createItem;

    return axios
      .post(postUrl, item, headerConfig(getState))
      .then((res) => {
        dispatch({
          type: ADD_ITEM,
          payload: res.data,
        });
      })
      .catch((err) => {
        dispatch(returnErrors(err));
      });
  };
}

/**
 * Handle updating the data of an existing item.
 * @param {Object} item - The new updated data of the item.
 */
export function updateItem(item) {
  return (dispatch, getState) => {
    const putUrl = api.updateItem + item.id;

    return axios
      .put(putUrl, item, headerConfig(getState))
      .then((res) => {
        dispatch({
          type: ADD_ITEM,
          payload: res.data,
        });
      })
      .catch((err) => {
        dispatch(returnErrors(err));
      });
  };
}

/**
 * Handle the deletion of an item.
 * @param {string} id - The id of an existing item.
 */
export function deleteItem(id) {
  return (dispatch, getState) => {
    const deleteUrl = api.deleteItem + id;

    return axios
      .delete(deleteUrl, headerConfig(getState))
      .then((res) => {
        dispatch({
          type: DELETE_ITEM,
          payload: id,
        });
      })
      .catch((err) => dispatch(returnErrors(err)));
  };
}
```

Item reducer:

```js
import {
  GET_ITEMS,
  ADD_ITEM,
  DELETE_ITEM,
  ITEMS_LOADING,
  ITEMS_ERROR,
  ADD_ITEM_PRELOAD,
} from '../actions/actionTypes';

const initialState = {
  items: [],
  isLoading: false,
  addedItem: false,
};

export default function itemReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ITEMS:
      return {
        ...state,
        items: action.payload.data,
        isLoading: false,
        addedItem: false,
      };
    case DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
      };
    case ADD_ITEM_PRELOAD:
      return {
        ...state,
        addedItem: false,
      };
    case ADD_ITEM:
      return {
        ...state,
        items: [action.payload, ...state.items],
        isLoading: false,
        addedItem: true,
      };
    case ITEMS_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case ITEMS_ERROR:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
}
```

The components of the app were fairly straightforward, they included views for the following:

- Viewing all items
- Adding items (form)
- Deleting items
- Editing items (form)
- Login (form)
- Sign up/register (form)

The views consisted of:

- A top navigation bar
- Main layout area
- Not found view

All styles were custom and fully responsive (desktop/mobile). I took some inspiration from Google's Material Design for the colors and shapes.

I performed minimal testing becuase I did not want to stray into implementation details and shallow rendering etc. I did just enough to ensure a component will redner without crashing.

The finished app main page:

[![React app main view](/images/ReactRedux-MainView.png)](/images/ReactRedux-MainView.png)
