const faunadb = require("faunadb");
// uuid
const uuid = require("react-uuid");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_SECRET,
});

exports.handler = async (event, context) => {
  const { userHandle, userImageUrl, body, imageUrl } = JSON.parse(event.body);

  // Create post in db.
  const createPost = () => {
    return new Promise(async (resolve, reject) => {
      try {
        await adminClient.query(
          q.Create(q.Collection("posts"), {
            data: {
              postId: uuid(),
              userHandle,
              userImageUrl,
              body,
              imageUrl,
              commentCount: 0,
            },
          })
        );
        resolve("success");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  return createPost()
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Post added successfully` }),
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
