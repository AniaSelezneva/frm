exports.handler = function (event, context, callback) {
  const { user } = context.clientContext;
  console.log("user in hey", user);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ hello: "hello" }),
  });
};
