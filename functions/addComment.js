const faunadb = require("faunadb");
// uuid
const uuid = require("react-uuid");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNA_SECRET,
});

exports.handler = async (event, context) => {
  const { comment, userHandle, userImageUrl, postId, recepient } = JSON.parse(
    event.body
  );

  const commentId = uuid();

  // Submit comment
  const submitComment = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Create(q.Collection("comments"), {
            data: {
              body: comment,
              userHandle,
              userImageUrl,
              postId,
              commentId,
            },
          })
        );
        resolve("success");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Increment comment count in post.
  const incrementCommentCount = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Get(q.Match(q.Index("posts_by_id"), postId))
        );

        const { commentCount } = res.data;

        await adminClient.query(
          q.Update(res.ref, {
            data: {
              commentCount: commentCount + 1,
            },
          })
        );
        resolve("success");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Add notification for the user who wrote the post.
  const addNotification = () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (recepient !== userHandle) {
          await adminClient.query(
            q.Create(q.Collection("notifications"), {
              data: {
                id: uuid(),
                recepient,
                sender: userHandle,
                postId: postId,
                type: "comment",
                commentId,
              },
            })
          );
        }

        resolve("success");
      } catch (error) {
        reject(error);
      }
    });
  };

  return submitComment()
    .then(() => {
      return incrementCommentCount();
    })
    .then(() => {
      // if the user who wrote the post isn't the one commenting
      //if (userHandle !== recepient) {
      return addNotification();
      // }
    })
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify(`Comment added successfully`),
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
