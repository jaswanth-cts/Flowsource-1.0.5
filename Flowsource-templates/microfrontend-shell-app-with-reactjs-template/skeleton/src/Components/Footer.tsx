import React from 'react'

function Footer() {
  return (
    <div>
    <footer className="text-center text-lg-start bg-light text-muted">
      <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        <div className="me-5 d-none d-lg-block">
          <span>Footer</span>
        </div>
      </section>
      <section className="">
        <div className="container text-center text-md-start mt-5">
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
                Column1
              </h6>
              <p>Row 1</p>
              <p>Row 2</p>
              <p>Row 3</p>
              <p>Row 4</p>
            </div>
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                Column2
              </h6>
              <p>Row 1</p>
              <p>Row 2</p>
              <p>Row 3</p>
              <p>Row 4</p>
            </div>
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                Column3
              </h6>
              <p>Row 1</p>
              <p>Row 2</p>
              <p>Row 3</p>
              <p>Row 4</p>
            </div>
          </div>
        </div>
      </section>
    </footer>
    </div>
  )
}

export default Footer