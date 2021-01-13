import React from 'react';
import Typed from 'react-typed';
import { useTranslation } from 'react-i18next';

import '../scss/home.scss';

import Scroller from './scroller';

export default function Home() {
  const [ t ] = useTranslation();

  return (
    <section id="home">
      <div className="overlay" />
      <div className="content" id="scroll-down">
        <div className="intro">
          <h2>{ t('home.helloIm') }</h2>
          <h1>Pablo Jordá García</h1>

          <Typed
            strings={[
              'frontend',
              'backend',
              'cloud',
              t('home.fsDeveloper')
            ]}
            className="type-wrap"
            typeSpeed={50}
            backSpeed={20}
            backDelay={500}
            loop={false}
          />
        </div>

        {/*<a href="../assets/CV.pdf"
           className="download-link hvr-shutter-out-horizontal"
           onClick="Materialize.toast('Resume Download Successfully', 4000, 'rounded')"
           data-position="left"
           data-delay="50"
           target="_blank">DOWNLOAD MY CV <i
          className="fa fa-download" /></a>*/}

        <Scroller
          href="about"
          className="scroller"
        />
      </div>
    </section>
  )
}
