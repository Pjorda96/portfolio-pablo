import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import '../scss/gotoTop.scss';

export default function GotoTop() {
  const { t } = useTranslation();

  function scrollToTop() {
    window.scrollTo(0, 0);
  }

  return (
    <button
      onClick={() => scrollToTop()}
      className='goto-top'
      title={t('gotoTop')}
    >
      <span>
        <FontAwesomeIcon icon={faArrowUp} />
      </span>
    </button>
  )
}
