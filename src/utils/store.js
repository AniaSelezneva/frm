import React, { createContext, useReducer } from "react";

const initialState = {
  loggedIn: false,
  user: {
    email: null,
    handle: null,
    imageUrl: null,
    userDbRef: null,
    notifications: [],
    likes: [],
    totalNotifications: null,
  },
  otherUser: undefined,
  posts: {},
  post: null,
  showLoginPrompt: false,
  waitToShowLoginPrompt: false,
  path: "",
  pendingPostLike: null,
  pendingPostUnlike: null,
};
// store has Provider and Consumer components
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "LOG_IN":
        return { ...state, loggedIn: true };
      case "SET_USER": {
        const { data, ref } = action.payload;
        return { ...state, user: { ...state.user, ...data, userDbRef: ref } };
      }
      case "SET_SHOW_LOGIN_PROMPT": {
        return { ...state, showLoginPrompt: action.payload };
      }
      case "SET_OTHER_USER": {
        return { ...state, otherUser: action.payload };
      }
      case "SET_WAIT_TO_SHOW_LOGIN_PROMPT": {
        return { ...state, waitToShowLoginPrompt: action.payload };
      }
      case "SET_PATH": {
        return { ...state, path: action.payload };
      }

      case "ADD_INFO": {
        const { location, hobbies, occupation } = action.payload;

        const newState = {
          ...state,
          user: { ...state.user, location, hobbies, occupation },
        };

        // If empty...
        if (location === undefined || location.trim() === "") {
          delete newState.user.location;
        }
        if (hobbies === undefined || hobbies.trim() === "") {
          delete newState.user.hobbies;
        }
        if (occupation === undefined || occupation.trim() === "") {
          delete newState.user.occupation;
        }

        return newState;
      }

      case "CHANGE_IMAGE": {
        return { ...state, user: action.payload };
      }

      case "REMOVE_POST": {
        const postId = action.payload;
        // If there are posts in store...
        if (Object.keys(state.posts).length > 0) {
          const postsData = state.posts.data;
          // 1. find its index,
          const postIndex = postsData.findIndex((post) => {
            return post.data.postId === postId;
          });

          // 2. delete post from store.
          if (postIndex >= 0) {
            postsData.splice(postIndex, 1);
          }

          return { ...state, posts: { ...state.posts, data: postsData } };
        }
      }

      case "REMOVE_INFO": {
        const fieldToRemove = action.payload;

        const newState = {
          ...state,
        };

        delete newState.user[fieldToRemove];

        return newState;
      }

      case "SET_POSTS": {
        return {
          ...state,
          posts: action.payload,
        };
      }
      case "ADD_POSTS": {
        return {
          ...state,
          posts: {
            ...state.posts,
            data: [...state.posts.data, ...action.payload.data],
            after: action.payload.after,
          },
        };
      }
      case "SET_CURRENT_POST": {
        return { ...state, post: action.payload };
      }
      case "SET_LIKES": {
        return { ...state, user: { ...state.user, likes: action.payload } };
      }
      case "SET_NOTIFICATIONS": {
        return {
          ...state,
          user: { ...state.user, notifications: action.payload },
        };
      }

      case "CHANGE_LIKE_COUNT": {
        const { newLikeCount, postId } = action.payload;

        let postsData;
        if (state.posts && state.posts.data && state.posts.length !== 0) {
          postsData = state.posts.data;
          const postIndex = state.posts.data.findIndex((post) => {
            return post.data.postId === postId;
          });

          if (postIndex >= 0) {
            postsData[postIndex].data.likeCount = newLikeCount;
          }
        } else {
          postsData = [];
        }

        // Refresh total likeCount in post in store if it's there.
        if (state.post !== null && state.post !== undefined) {
          return {
            ...state,
            post: {
              ...state.post,
              data: {
                ...state.post.data,
                likeCount: newLikeCount,
              },
            },
            posts: { ...state.posts, data: postsData },
          };
        } else {
          return {
            ...state,
            posts: { ...state.posts, data: postsData },
          };
        }
      }

      case "LIKE_POST": {
        const { like, postId } = action.payload;

        // Add new like.
        const likes = state.user.likes;
        if (likes.length > 0) {
          // If it's not already there...
          const index = likes.findIndex((like) => {
            return like.data.postId === postId;
          });
          if (index < 0) {
            likes.push(like);
          }
        } else {
          likes.push(like);
        }

        return {
          ...state,
          user: {
            ...state.user,
            likes,
          },
        };
      }
      case "UNLIKE_POST": {
        const { postId } = action.payload;

        // Find like ref.
        const likeIndex = state.user.likes.findIndex((like) => {
          return like.data.postId === postId;
        });

        const likes = state.user.likes;
        // Remove like if it exists.
        if (likeIndex >= 0) {
          likes.splice(likeIndex, 1);
        }

        return {
          ...state,
          user: {
            ...state.user,
            likes,
          },
        };
      }

      case "SET_PENDING_POST_LIKE": {
        const postId = action.payload;

        return {
          ...state,
          pendingPostLike: postId,
          pendingPostUnlike: null,
        };
      }

      case "SET_PENDING_POST_UNLIKE": {
        const postId = action.payload;

        return {
          ...state,
          pendingPostUnlike: postId,
          pendingPostLike: null,
        };
      }

      case "REMOVE_NOTIFICATION": {
        const notifications = state.user.notifications.data;

        const index = notifications.findIndex(
          (notification) => notification.data.id === action.payload
        );

        if (index >= 0) {
          notifications.splice(index, 1);
        }

        return {
          ...state,
          user: {
            ...state.user,
            notifications: { ...state.user.notifications, data: notifications },
          },
        };
      }
      case "REMOVE_ALL_NOTIFICATIONS": {
        return {
          ...state,
          user: {
            ...state.user,
            totalNotifications: 0,
            notifications: { data: [] },
          },
        };
      }

      case "SET_COMMENTS": {
        return {
          ...state,
          post: { ...state.post, comments: action.payload },
        };
      }
      case "ADD_COMMENTS": {
        return {
          ...state,
          post: {
            ...state.post,
            comments: {
              data: [...state.post.comments.data, ...action.payload.data],
              after: action.payload.after,
            },
          },
        };
      }
      case "CHANGE_AVATAR": {
        const { imageUrl } = action.payload;
        return {
          ...state,
          user: { ...state.user, imageUrl },
        };
      }
      case "SET_POST_ID": {
        return {
          ...state,
          post: { ...state.post, postId: action.payload },
        };
      }
      case "DELETE_COMMENT": {
        const commentId = action.payload;
        const commentsData = state.post.comments.data;

        // Find comment index.
        const commentIndex = commentsData.findIndex((comment) => {
          return comment.data.commentId === commentId;
        });

        // Remove comment if it exists.
        if (commentIndex >= 0) {
          commentsData.splice(commentIndex, 1);
        }

        return {
          ...state,
          post: {
            ...state.post,
            comments: { ...state.post.comments, data: commentsData },
          },
        };
      }
      case "LOGOUT": {
        return {
          ...state,
          loggedIn: false,
          user: {
            email: null,
            handle: null,
            imageUrl: null,
            userDbRef: null,
            notifications: [],
            totalNotifications: null,
          },
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };

// Provider sends state and dispatch to all the lower components.
// Lower components will access it through useContext(store).
// Store is created here.
