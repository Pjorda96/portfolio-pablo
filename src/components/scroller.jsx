import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle} from "@fortawesome/free-solid-svg-icons";

import '../scss/scroller.scss'

export default function Scroller({href}) {
  return (
    <a className="scroller" title="Scroll Down" href={`#${href}`}>
      <FontAwesomeIcon icon={faCircle} aria-hidden="true" />
    </a>
  )
}
