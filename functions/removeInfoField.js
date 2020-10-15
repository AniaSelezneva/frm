const faunadb = require("faunadb");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNA_SECRET,
});

exports.handler = async (event) => {
  const fieldToRemove = event.headers["info-to-remove"];
  const userHandle = event.headers["user-handle"];

  return adminClient
    .query(q.Get(q.Match(q.Index("users_by_handle"), userHandle)))
    .then((res) => {
      return adminClient.query(
        q.Update(res.ref, {
          data: {
            [fieldToRemove]: null,
          },
        })
      );
    })
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify(`Info successfully removed`),
      };
    })
    .catch((error) => {
      console.log("error", error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });
};
