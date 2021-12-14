import { PageHeader } from "antd";
import React from "react";
import "./header.scss";

// displays a page header

export default function Header() {
  return (
    <div className="header">
      <a href="https://github.com/swapp1990/scifi-loot" target="_blank" rel="noopener noreferrer">
        {/* <PageHeader title="Spaceborn" subTitle="forkable NFT blockchain game" /> */}
        <img src="images/Spaceborn.png" width="200px"></img>
      </a>
    </div>
  );
}
