import React from 'react';
import { useTranslation } from "react-i18next";

// Components
import Home from '../../components/home';
import Header from '../../components/header';
import GotoTop from "../../components/gotoTop";

export default function DefaultLayout() {
  const { i18n } = useTranslation();

  const changeLanguage = lang => { // TODO: delete
    i18n.changeLanguage(lang)
      .then(() => console.log('completed'))
      .catch(err => console.log(err));
  }

  return (
    <div className='overflow-wrap'>
      <Home />
      <Header />

      <div className="container-fluid">
        container fluid
        <button onClick={() => changeLanguage('es')}>es</button> {/*TODO: delete*/}
        <button onClick={() => changeLanguage('en')}>en</button> {/*TODO: delete*/}
      </div>

      <GotoTop />

      {/*<div className="modal-wrap flex">
        <div className="mask"></div>
        <div className="modal" id="modal">
          <div className="carousel-wrap">
            <div className="window">
              <div id="carousel">
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
              </div>
              <i className="mdi mdi-chevron-left" id="prev"></i>
              <i className="mdi mdi-chevron-right" id="next"></i>
            </div>
          </div>
          <div className="info-box">
            <div className="title"></div>
            <div className="tag"></div>
            <div className="detail"></div>
            <a href="#0" target="_blank"
            >
              <div className="button">
                <i className="mdi mdi-open-in-new"></i>VIEW SITE
              </div>
            </a>
          </div>
          <i className="close mdi mdi-close"></i>
        </div>
      </div>

      <section id="home" className="flex height-fix">
        <div id="pt" className="canvas"></div>
        <div className="flex">
          <div className="text">
            Hello, I'm <span className="highlight">Matthew Williams</span>.
            <br/>
            I'm a full-stack web developer.
          </div>

          <div className="button page-link" dest="about">
            View my work <i className="mdi mdi-arrow-right"></i>
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
      </section>

      ABOUT
      <section id="about">
        <div className="container flex">
          <div className="header waypoint" data-animation="slide-in-left">
            ABOUT
          </div>
          <div
            className="header-bar waypoint"
            data-animation="slide-in-left"
            data-delay=".5s"
          ></div>

          <div className="flex row label-wrap">
            <div className="flex row-gt-sm">
              <div className="flex bullet-wrap ">
                <div className="hex-wrap waypoint" data-animation="flip-in-x">
                  <div className="hexagon">
                    <i className="mdi mdi-speedometer"></i>
                  </div>
                </div>
                <div className="waypoint" data-animation="fade-in">
                  <div className="label bold">Fast</div>
                  <div>
                    Fast load times and lag free interaction, my highest
                    priority.
                  </div>
                </div>
              </div>

              <div className="flex bullet-wrap ">
                <div
                  className="hex-wrap waypoint"
                  data-animation="flip-in-x"
                  data-delay=".2s"
                >
                  <div className="hexagon">
                    <i className="mdi mdi-cellphone-link"></i>
                  </div>
                </div>
                <div className="waypoint" data-animation="fade-in" data-delay=".2s">
                  <div className="label bold">Responsive</div>
                  <div>My layouts will work on any device, big or small.</div>
                </div>
              </div>
            </div>
            <div className="flex row-gt-sm">
              <div className="flex bullet-wrap ">
                <div
                  className="hex-wrap waypoint"
                  data-animation="flip-in-x"
                  data-delay=".4s"
                >
                  <div className="hexagon">
                    <i className="mdi mdi-lightbulb-outline"></i>
                  </div>
                </div>
                <div className="waypoint" data-animation="fade-in" data-delay=".4s">
                  <div className="label bold">Intuitive</div>
                  <div>Strong preference for easy to use, intuitive UX/UI.</div>
                </div>
              </div>

              <div className="flex bullet-wrap ">
                <div
                  className="hex-wrap waypoint"
                  data-animation="flip-in-x"
                  data-delay=".6s"
                >
                  <div className="hexagon">
                    <i className="mdi mdi-rocket"></i>
                  </div>
                </div>
                <div className="waypoint" data-animation="fade-in" data-delay=".6s">
                  <div className="label bold">Dynamic</div>
                  <div>
                    Websites don't have to be static, I love making pages come
                    to life.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="skills-wrapper flex row-gt-sm">
            <div
              className="flex flex-50-gt-sm waypoint"
              data-animation="slide-in-left"
            >
              <img src="img/me.png" className="me"/>
              <div className="label bold">Who's this guy?</div>
              <div>
                I'm a Front-End Developer for
                <a
                  className="highlight"
                  href="http://www.chownow.com"
                  target="_blank"
                >ChowNow</a
                >
                in Los Angeles, CA.
                <br/>
                I have serious passion for UI effects, animations and creating
                intuitive, dynamic user experiences.
                <br/>
                <span className="page-link highlight" dest="contact"
                >Let's make something special.</span
                >
              </div>
            </div>

            <div
              className="flex flex-50-gt-sm waypoint bars-wrap"
              data-animation="slide-in-right"
            >
              <div className="bar flex">
                <div className="bar fill" style="width:90%">
                  <div className="tag bold flex">CSS</div>
                </div>
                <span>90%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:90%">
                  <div className="tag bold flex">HTML</div>
                </div>
                <span>90%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:80%">
                  <div className="tag bold flex">React</div>
                </div>
                <span>80%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:80%">
                  <div className="tag bold flex">JavaScript</div>
                </div>
                <span>80%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:50%">
                  <div className="tag bold flex">Angular</div>
                </div>
                <span>50%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:65%">
                  <div className="tag bold flex">Node.js</div>
                </div>
                <span>65%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:65%">
                  <div className="tag bold flex">Ruby/Rails</div>
                </div>
                <span>65%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:50%">
                  <div className="tag bold flex">UI Design</div>
                </div>
                <span>50%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:60%">
                  <div className="tag bold flex">Photoshop</div>
                </div>
                <span>60%</span>
              </div>

              <div className="bar flex">
                <div className="bar fill" style="width:50%">
                  <div className="tag bold flex">Sketch</div>
                </div>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      PORTFOLIO
      <section className="flex" id="portfolio">
        <div className="header waypoint" data-animation="slide-in-right">
          PROJECTS
        </div>
        <div
          className="header-bar waypoint"
          data-animation="slide-in-right"
          data-delay=".3s"
        ></div>

        <div className="filter-wrap waypoint" data-animation="fade-in">
          <div className="flex row">
            <div className="filter" data-filter="all">ALL</div>
            <div className="filter" data-filter=".rails">RUBY/RAILS</div>
            <div className="filter" data-filter=".react">REACT-JS</div>
            <div className="filter" data-filter=".js">JAVASCRIPT</div>
          </div>
          <div className="float-bar">
            <div className="flex row">
              <div className="filter" data-filter="all">ALL</div>
              <div className="filter" data-filter=".rails">RUBY/RAILS</div>
              <div className="filter" data-filter=".react">REACT-JS</div>
              <div className="filter" data-filter=".js">JAVASCRIPT</div>
            </div>
          </div>
        </div>

        <div id="gallery" className="container flex row wrap waypoint">
          <div className="mix react" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">ChowNow Ordering</div>
                <span className="highlight">React JS / Python</span>
              </div>
              <div className="button" id="ordering">LEARN MORE</div>
            </div>
          </div>

          <div className="mix react" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">ChowNow Discover</div>
                <span className="highlight">React JS / Python</span>
              </div>
              <div className="button" id="discover">LEARN MORE</div>
            </div>
          </div>

          <div className="mix react" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">New Relic</div>
                <span className="highlight">React / Ruby on Rails / AEM</span>
              </div>
              <div className="button" id="newrelic">LEARN MORE</div>
            </div>
          </div>

          <div className="mix js" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">Roambi</div>
                <span className="highlight">JavaScript</span>
              </div>
              <div className="button" id="roambi">LEARN MORE</div>
            </div>
          </div>

          <div className="mix rails" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">Walker Tracker</div>
                <span className="highlight">JS / Ruby on Rails</span>
              </div>
              <div className="button" id="walker">LEARN MORE</div>
            </div>
          </div>

          <div className="mix js" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">MY STAND</div>
                <span className="highlight">JS / Node.js on Sails</span>
              </div>
              <div className="button" id="mystand">LEARN MORE</div>
            </div>
          </div>

          <div className="mix js" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">NEVER SURRENDER</div>
                <span className="highlight">JavaScript</span>
              </div>
              <div className="button" id="never">LEARN MORE</div>
            </div>
          </div>

          <div className="mix rails" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">Powur</div>
                <span className="highlight">Angular / Ruby on Rails</span>
              </div>
              <div className="button" id="powur">LEARN MORE</div>
            </div>
          </div>

          <div className="mix js" data-my-order="1">
            <div>
              <div className="card"></div>
              <div className="text">
                <div className="bold">The Mall</div>
                <span className="highlight">React.js / Node</span>
              </div>
              <div className="button" id="themall">LEARN MORE</div>
            </div>
          </div>
        </div>
      </section>

      BLOG
      <section id="blog">
        <div className="container flex">
          <div className="header waypoint" data-animation="slide-in-left">BLOG</div>
          <div
            className="header-bar waypoint"
            data-animation="slide-in-left"
            data-delay=".5s"
          ></div>

          <div className="flex row wrap">
            <div className="flex row-gt-sm">
              <a
                href="http://blog.eyecuelab.com/2016/04/29/breaking-your-coders-block/"
                target="_blank"
              >
                <div className="blog-wrap waypoint" data-animation="fade-in">
                  <div className="fade-wrap">
                    <div className="thumb" id="thumb-1"></div>
                    <div className="label bold">Breaking Your Coder's Block</div>
                    <div className="date">APRIL 29, 2016</div>
                    <div className="bar"></div>
                    <div className="text">
                      At one time or another, as a developer, we've all found
                      ourselves hopelessly stuck on a coding issue...
                    </div>
                  </div>
                </div>
              </a>
              <a
                href="http://blog.eyecuelab.com/2015/03/19/this-is-your-brain-on-caffeine/"
                target="_blank"
              >
                <div
                  className="blog-wrap waypoint"
                  data-animation="fade-in"
                  data-delay=".2s"
                >
                  <div className="fade-wrap">
                    <div className="thumb" id="thumb-2"></div>
                    <div className="label bold">
                      !Awake: This is Your Brain on Caffeine
                    </div>
                    <div className="date">MARCH 19, 2015</div>
                    <div className="bar"></div>
                    <div className="text">
                      If there's one thing I can truly claim to be an expert on,
                      it's staying awake. For five years I struggled to stay
                      employed...
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div className="flex row-gt-sm">
              <a
                href="http://blog.eyecuelab.com/2015/03/04/getting-a-handle-on-handlebars/"
                target="_blank"
              >
                <div
                  className="blog-wrap waypoint"
                  data-animation="fade-in"
                  data-delay=".4s"
                >
                  <div className="fade-wrap">
                    <div className="thumb" id="thumb-3"></div>
                    <div className="label bold">Getting a Handle on Handlebars</div>
                    <div className="date">MARCH 04, 2015</div>
                    <div className="bar"></div>
                    <div className="text">
                      Here at EyeCue Lab we render most of our data-laden HTML
                      pages in Handlebar templates...
                    </div>
                  </div>
                </div>
              </a>
              <a
                href="http://blog.eyecuelab.com/2015/02/23/essential_extensions/"
                target="_blank"
              >
                <div
                  className="blog-wrap waypoint"
                  data-animation="fade-in"
                  data-delay=".6s"
                >
                  <div className="fade-wrap">
                    <div className="thumb" id="thumb-4"></div>
                    <div className="label bold">
                      5 Extensions for Your Chrome Toolbelt
                    </div>
                    <div className="date">FEBRUARY 23, 2015</div>
                    <div className="bar"></div>
                    <div className="text">
                      If you're not using Google Chrome as a front-end web
                      developer, you're missing out. Not only is Chrome the...
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      CONTACT
      <section id="contact">
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 100 102"
          height="75"
          width="100%"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          className="svgcolor-light"
        >
          <path d="M0 0 L50 100 L100 0 Z" fill="white" stroke="white"></path>
        </svg>
        <div className="container flex">
          <div className="header waypoint" data-animation="slide-in-left">
            CONTACT
          </div>
          <div
            className="header-bar waypoint"
            data-animation="slide-in-right"
            data-delay=".25s"
          ></div>
          <div
            className="highlight waypoint"
            data-animation="slide-in-right"
            data-delay=".5s"
          >
            Have a question or want to work together?
          </div>
          <form
            className="waypoint"
            data-animation="pop-in"
            data-delay=".5s"
            id="contact-form"
          >
            <input placeholder="Name" type="text" name="name" required/>
            <input
              placeholder="Enter email"
              type="email"
              name="email"
              required
            />
            <textarea
              placeholder="Your Message"
              type="text"
              name="message"
            ></textarea>
            <div id="success">
              <div>
                Your message was sent successfully. Thanks!<span
                id="close"
                className="mdi mdi-close"
              ></span>
              </div>
            </div>
            <input className="button" type="submit" id="submit" value="SUBMIT"/>
          </form>
        </div>
      </section>

      <footer>
        <i className="mdi mdi-chevron-double-up page-link" dest="home"></i>

        <div className="icon-wrap flex row">
          <a href="https://www.linkedin.com/in/mattwilliams85">
            <div className="flex icon" id="icon-2">
              <i className="mdi mdi-linkedin"></i>
            </div>
          </a>
          <a href="https://www.facebook.com/matthew.williams.351">
            <div className="flex icon" id="icon-3">
              <i className="mdi mdi-facebook"></i>
            </div>
          </a>
          <a href="https://instagram.com/infinite_edge/">
            <div className="flex icon" id="icon-4">
              <i className="mdi mdi-instagram"></i>
            </div>
          </a>
          <a href="http://codepen.io/matthewwilliams/">
            <div className="flex icon" id="icon-5">
              <i className="mdi mdi-codepen"></i>
            </div>
          </a>
        </div>
        <div className="info-box">
          <div className="footnote">
            MATTHEW WILLIAMS <span className="highlight">&copy;2015</span>
          </div>
        </div>
      </footer>*/}
    </div>
  )
}
