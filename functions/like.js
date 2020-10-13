const faunadb = require("faunadb");
// uuid
const uuid = require("react-uuid");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNA_SECRET,
});

exports.handler = async (event) => {
  const { userHandle, postId, recepient, likeCount } = JSON.parse(event.body);

  const likeId = uuid();

  let res;

  // Check if already liked.
  const checkIfLiked = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Exists(
            q.Match(q.Index("like_by_user_and_postid"), [
              q.Casefold(userHandle),
              q.Casefold(postId),
            ])
          )
        );
        if (res === true) {
          reject("Already liked");
        } else {
          resolve(res);
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  // Add like
  const addLike = () => {
    return new Promise(async (resolve, reject) => {
      try {
        res = await adminClient.query(
          q.Create(q.Collection("likes"), {
            data: {
              userHandle,
              postId,
            },
          })
        );

        resolve("success");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Increment like count in post.
  const incrementLikeCount = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Get(q.Match(q.Index("posts_by_id"), postId))
        );

        const { likeCount } = res.data;

        await adminClient.query(
          q.Update(res.ref, {
            data: {
              likeCount: likeCount + 1,
            },
          })
        );
        resolve("success");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Add notification for the user whose post that is.
  const addNotification = () => {
    return new Promise(async (resolve, reject) => {
      try {
        await adminClient.query(
          q.Create(q.Collection("notifications"), {
            data: {
              id: uuid(),
              recepient,
              sender: userHandle,
              postId: postId,
              type: "like",
              likeId,
            },
          })
        );
        resolve("success");
      } catch (error) {
        reject(error);
      }
    });
  };

  return checkIfLiked()
    .then((res) => {
      return addLike();
    })
    .then(() => {
      return incrementLikeCount();
    })
    .then(() => {
      return addNotification();
    })
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify(res),
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
