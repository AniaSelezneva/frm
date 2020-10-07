const faunadb = require("faunadb");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_SECRET,
});

exports.handler = async (event, context) => {
  const { location, hobbies, occupation, userHandle } = JSON.parse(event.body);

  return adminClient
    .query(q.Get(q.Match(q.Index("users_by_handle"), userHandle)))
    .then((res) => {
      return adminClient.query(
        q.Update(res.ref, {
          data: {
            location: location.trim() === "" ? null : location,
            hobbies: hobbies.trim() === "" ? null : hobbies,
            occupation: occupation.trim() === "" ? null : occupation,
          },
        })
      );
    })
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Info successfully updated` }),
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
