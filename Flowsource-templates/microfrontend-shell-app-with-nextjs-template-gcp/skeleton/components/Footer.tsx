import React from 'react'

function Footer() {
  return (
    <div>
    <footer className="text-center text-lg-start bg-light text-muted fixed-bottom">
      <section className="">
        <div className="container text-center text-md-start mt-1">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <i className="fas fa-gem me-3"></i>Organization Name
              </h6>
              <p>
                Here you can use rows and columns to organize your footer content.
              </p>
            </div>
            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                Section
              </h6>
              <p>Item 1</p>
              <p>Item 2</p>
            </div>
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                Section
              </h6>
              <p>Item 1</p>
              <p>Item 2</p>
            </div>
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                  Section
              </h6>
              <p>Item 1</p>
              <p>Item 2</p>
            </div>
          </div>
        </div>
      </section>
    </footer>
    </div>
  )
}

export default Footer