import "./Home.css";
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { animate, stagger } from "motion";

export default function Home() {
  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  useEffect(() => {
    animate(
      "#box",
      { x: 200 },
      {
        delay: stagger(0.1),
        duration: 0.5,
        easing: [0.22, 0.03, 0.26, 1],
      },
    );
  }, []);

  return (
    <>
      <div className="home">
        <h1>Wands for Wizards</h1>
        <div id="box" style={{ height: 50, width: 50, borderRadius: 10, backgroundColor: "yellow" }}></div>
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
