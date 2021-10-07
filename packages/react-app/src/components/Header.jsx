import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/swapp1990/scifi-loot" target="_blank" rel="noopener noreferrer">
      <PageHeader title="Scifi Gear" subTitle="forkable Scifi Gear NFT blockchain game" style={{ cursor: "pointer" }} />
    </a>
  );
}
