import React from "react";
import RDTI from "../assets/images/RDT.webp";

export default function Header() {
  return (
    <div style={{ color: "white", textAlign: "left", paddingTop: 10 }}>

      <div width={"100%"} className="d-flex flex-row mx-auto">
        <div style={{ maxWidth: "50px" }} className="me-3">
          <img width={"100%"} src={RDTI}></img>
        </div>
        <h4 style={{ color: "white" }} className="my-auto">
          RDT Exchange
        </h4>
      </div>
      <div className="mt-3 d-flex flex-column">
        <span style={{ color: "white" }}>
          Exchange your Raven Dynamics Tokens with KETH!
        </span>
        <span>
          - Made by <a href="https://frenzoid.dev" target="_blank">MrFrenzoid</a> with <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank">🏗 scaffold-eth</a>.
        </span>
      </div>
    </div>
  );
}
