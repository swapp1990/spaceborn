import "./Home.css";
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";

export default function Home() {
  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);
  return (
    <>
      <div className="home">
        <h1>Wands for Wizards</h1>
        <Button type={"primary"}>
          <Link
            onClick={() => {
              setRoute("/app");
            }}
            to="/app"
          >
            ENTER GAME
          </Link>
        </Button>
      </div>
    </>
  );
}
