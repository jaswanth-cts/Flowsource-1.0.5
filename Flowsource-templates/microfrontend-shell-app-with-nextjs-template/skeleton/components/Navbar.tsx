import Link from 'next/link'
import React from 'react'
import Cart from './Cart'

function Navbar({organizationName}: { organizationName: string }) {
    return (
<nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container">
    <a className="navbar-brand" href="#">{organizationName}</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
      <div className="navbar-nav">
        <Link className="nav-link active" aria-current="page" href="/">Home</Link>
        <Link className="nav-link" href="/sampleapp">Sample MFE App</Link>
        <Link className="nav-link" href="/feature">Features</Link>
        <a className="nav-link" href="#">Pricing</a>
        <a className="nav-link disabled" aria-disabled="true">Disabled</a>
        <Cart/>
      </div>
    </div>
  </div>
</nav>
    )
}

export default Navbar
