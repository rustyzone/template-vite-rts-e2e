import React from "react";
import { render } from "react-dom";
import Onboarding from "./Onboarding";

console.log("onboarding script");

const root = document.querySelector("#root");

render(<Onboarding />, root);
