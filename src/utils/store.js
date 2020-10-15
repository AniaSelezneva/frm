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
  posts: {},
  post: null,
  query: "",
};
// store has Provider and Consumer components
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case "LOG_IN":
        return { ...state, loggedIn: true };
      case "SET_USER": {
        const { data, ref } = action.payload;
        return { ...state, user: { ...state.user, ...data, userDbRef: ref } };
      }
      case "CHANGE_IMAGE": {
        return { ...state, user: action.payload };
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
      case "SET_QUERY": {
        return {
          ...state,
          query: action.payload,
        };
      }

      case "CHANGE_LIKE_COUNT": {
        const { newLikeCount, postId } = action.payload;

        let postsData;
        if (
          state.posts !== undefined &&
          state.posts !== null &&
          state.posts.length !== 0
        ) {
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
