import { default as Dashboard } from "./figma/Dashboard";
import { default as Game } from "./figma/Game";

export default function WireframeUI(contracts, address) {
    return (<div><Game contracts={contracts, address} /></div>)
}