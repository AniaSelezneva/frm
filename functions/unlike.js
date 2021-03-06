const faunadb = require("faunadb");
// uuid
const uuid = require("react-uuid");

const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNA_SECRET,
});

exports.handler = async (event) => {
  let { userHandle, postId, likeCount, recepient } = JSON.parse(event.body);

  // Check if this like exists.
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
        if (res === false) {
          reject(`Like doesn't exist`);
        } else {
          resolve(res);
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  // Delete notification associated with this like.
  const deleteNotification = () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (recepient !== userHandle) {
          const notification = await adminClient.query(
            q.Get(
              q.Match(q.Index("like_notification_by_sender_and_postid"), [
                userHandle,
                postId,
              ])
            )
          );
          await adminClient.query(q.Delete(notification.ref));
          resolve("notification deleted");
        } else {
          resolve("No notification created");
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Reduce the total number of likes in post.
  const reduceTotalLikes = () => {
    return new Promise(async (resolve, reject) => {
      const post = await adminClient.query(
        q.Get(q.Match(q.Index("posts_by_id"), postId))
      );

      try {
        await adminClient.query(
          q.Update(post.ref, {
            data: {
              likeCount,
            },
          })
        );
        resolve("total likes reduced");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Delete like itself.
  const deleteLike = () => {
    return new Promise(async (resolve, reject) => {
      const like = await adminClient.query(
        q.Get(q.Match(q.Index("like_by_user_and_postid"), [userHandle, postId]))
      );

      try {
        // Delete like itself
        await adminClient.query(q.Delete(like.ref));
        resolve("like deleted");
      } catch (error) {
        reject(error);
      }
    });
  };

  return checkIfLiked()
    .then(() => {
      return deleteLike();
    })
    .then(() => {
      return reduceTotalLikes();
    })
    .then(() => {
      deleteNotification();
    })
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify("Like successfully deleted"),
      };
    })
    .catch((error) => {
      console.log("Error: ", error);
      if (error == `Like doesn't exist`) {
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
