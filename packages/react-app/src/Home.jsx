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
        <div
          id="box"
          style={{
            height: 50,
            width: 150,
            borderRadius: 10,
            display: "flex",
            alignContent: "space-around",
            columnGap: "120px",
          }}
        >
          <span style={{ fontSize: 50, color: "red" }}>Θ</span>
          <span style={{ fontSize: 50, color: "red" }}>Ϡ</span>
          <span style={{ fontSize: 50, color: "red" }}>ʓ</span>
        </div>
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

        <div
          id="box"
          style={{
            height: 50,
            width: 150,
            borderRadius: 10,
            display: "flex",
            alignContent: "space-around",
            columnGap: "120px",
          }}
        ></div>
      </div>
    </>
  );
}
