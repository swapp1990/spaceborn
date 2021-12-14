import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import SplashPage from "./views/SplashPage";

const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/">
        <SplashPage />
      </Route>
      <Route exact path="/app">
        <ApolloProvider client={client}>
          <ThemeSwitcherProvider themeMap={themes} defaultTheme={"dark"}>
            <App subgraphUri={subgraphUri} />
          </ThemeSwitcherProvider>
        </ApolloProvider>
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById("root"),
);
