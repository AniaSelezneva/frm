const config = {
  apiKey: "AIzaSyCz5dNIi1LHfaxhb-g_FIS3wQ7Vla0ZBTs",
  authDomain: "watch-forum.firebaseapp.com",
  databaseURL: "https://watch-forum.firebaseio.com",
  projectId: "watch-forum",
  storageBucket: "watch-forum.appspot.com",
  messagingSenderId: "27125407602",
  appId: "1:27125407602:web:c74f43b62254ef6f7a47eb",
  measurementId: "G-Y4G43N9LZ1",
};

exports.handler = async (event, context) => {
  const { filename } = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify(filename),
  };
};
