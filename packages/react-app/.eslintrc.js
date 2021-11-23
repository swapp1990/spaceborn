module.exports = {
  env: {
    browser: true,
  },
  parser: "babel-eslint",
  // airbnb disabled after upgrade to cra 4 due to errors in our code
  extends: [/*"airbnb"*/ "plugin:prettier/recommended"],
  plugins: ["babel"],
  rules: {
    "prettier/prettier": 0,
  },
};
