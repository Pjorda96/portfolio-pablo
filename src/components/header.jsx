import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

import '../scss/header.scss';

export default function Header() {
  return (
    <header id="home" className="header">
      <div className="flex">
        <div className="text">
          Hello, I'm <span className="highlight">Matthew Williams</span>.
          <br/>
          I'm a full-stack web developer.
        </div>

        <div className="button page-link">{/*dest="about" change to link*/}
          View my work <FontAwesomeIcon icon={faArrowRight} />
        </div>

        <nav className="flex">
          <div className="link-wrap">
            <div className="active page-link" dest="home">home</div>
            <div className="page-link" dest="about">about</div>
            <div className="page-link" dest="portfolio">portfolio</div>
            <div className="page-link" dest="blog">blog</div>
            <div className="page-link" dest="contact">contact</div>
          </div>
          <i className="mdi mdi-menu"></i>
        </nav>
      </div>
    </header>
  )
}
