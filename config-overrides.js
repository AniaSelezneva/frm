const rewireSvgReactLoader = require("react-app-rewire-svg-react-loader");

module.exports = function override(config, env) {
  // // Replaces the webpack rule that loads SVGs as static files to leave out SVG files for us to handle
  // const indexOfRuleToRemove = config.module.rules.findIndex((rule) =>
  //   rule.test.toString().includes("svg")
  // );
  // config.module.rules.splice(indexOfRuleToRemove, 1, {
  //   test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
  //   loader: require.resolve("file-loader"),
  //   options: {
  //     name: "static/media/[name].[hash:8].[ext]",
  //     esModule: false,
  //   },
  // });

  config = rewireSvgReactLoader(config, env);
  return config;
};
