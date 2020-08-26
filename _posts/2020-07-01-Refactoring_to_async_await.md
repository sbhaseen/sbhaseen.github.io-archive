---
layout: post
title: Refactoring to Async/Await from then/catch
date: 2020-07-01
tags: ['JavaScript', 'Node.js', Async, Promises]
---

Recently, I was refactoring some projects and came across documentation which demonstrated using Async/Await in place of then/catch for Promise based responses.

I found this to yeild better readability for many scenarios, especially data fetching for API's. Thus I made this small post to detail some of the work I've done. This invloves mostly request/response callback in Express.js.

---

## The then-catch original code

Here, we examine an API route written for and Express.js server using Mongoose for a database connection. The object `List` is a Mongoose data schema model.

This is written using the `then` method to handle a promise based callback.

```js
/**
 * GET /lists
 * @desc: Get all lists
 */
router.get('/', (req, res) => {
  List.find()
    .then((results) => {
      return res.status(200).json(results);
    })
    .catch((error) => {
      return res.status(500).json({ message: 'Failed to fetch list.', error });
    });
});
```

## Code refactored to Async/Await in a try-catch block

This code is now refactored to use the `async` keyword to define the router callback funcation as asynchronous.

The actual Promise based call is executed inside the `try` block which can catch errors in the following `catch` block.

```js
/**
 * GET /lists
 * @desc: Get all lists
 */
router.get('/', async (req, res) => {
  try {
    const results = await List.find();
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch list.', error });
  }
});
```

## Conclusions

Although this was a relatively simple example, using Async/Await can help to avoid callback hell in more complex scenarios with multiple promise based function calls.

One possible scenario I can think of, would be where many microservice API's need to be queried at the same time (a dashboard app, for example).
