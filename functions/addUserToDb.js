const faunadb = require("faunadb");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNA_SECRET,
});

exports.handler = async (event) => {
  const { handle, email } = JSON.parse(event.body);

  // Add user to 'users' collection in db.
  const addUserToDb = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const ret = await adminClient.query(
          q.Create(q.Collection("users"), {
            data: {
              handle: q.LowerCase(handle),
              email: q.LowerCase(email),
              imageUrl: `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_BUCKET}/o/dandelion.jpg?alt=media`,
            },
          })
        );
        resolve(ret);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Check if user handle doesn't exist in db already.
  const isHandleUnique = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Exists(q.Match(q.Index("users_by_handle"), q.Casefold(handle)))
        );

        // Handle already exists in database.
        if (res === true) {
          reject("Handle already taken");
        } else {
          resolve("Handle is unique");
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Check if user email doesn't exist in db already.
  const isEmailUnique = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Exists(q.Match(q.Index("users_by_email"), q.Casefold(email)))
        );

        // Email already exists in database.
        if (res === true) {
          reject("Email already in use");
        } else {
          resolve("Email is unique");
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  return isEmailUnique()
    .then(() => {
      return isHandleUnique();
    })
    .then(() => {
      return addUserToDb();
    })
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify("User is added to database"),
      };
    })
    .catch((error) => {
      console.log(error);

      if (error == "Handle already taken") {
        return {
          statusCode: 400,
          body: JSON.stringify(error),
        };
      } else if (error == "Email already in use") {
        return {
          statusCode: 400,
          body: JSON.stringify(error),
        };
      }
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });
};
