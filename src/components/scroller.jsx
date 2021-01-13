import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import '../scss/scroller.scss'

export default function Scroller({href}) {
  const [ t ] = useTranslation()

  return (
    <a className="scroller" title={ t('home.scrollDown') } href={`#${href}`}>
      <FontAwesomeIcon icon={faCircle} aria-hidden="true" />
    </a>
  )
}
