exports.handler = function (event, context, callback) {
  console.log(event.body);
  callback(null, {
    statusCode: 400,
    body: JSON.stringify({ msg: "hello" }),
  });
};
