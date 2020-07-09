import React from 'react';
import '../scss/spinner.scss'

import { Spinner as BSpinner } from "react-bootstrap";

export default function Spinner() {
  // return <div className="loader">Loading...</div>
  return (
    <BSpinner className="loader" animation="border" variant="dark" role="status">
      <span className="sr-only">Loading...</span>
    </BSpinner>
  )
}
