import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEntity } from '@backstage/plugin-catalog-react';
import attachment_icon from '../../Icons/attachment_icon.png';
import failed_healed_info from '../../Icons/failed_healed_info.png';
import cssClasses from './MaintenanceReportCss.js';
import {
  fetchApiRef,
  useApi,
  configApiRef,
} from '@backstage/core-plugin-api';
import Modal from 'react-bootstrap/Modal';

import log from 'loglevel';

const MaintenanceStatus = props => {
  const classes = cssClasses();
  const { entity } = useEntity();
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const [isLoading, setLoading] = useState(true);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [popUpImage, setPopUpImage] = useState('');
  const [isFailedDownload, setFailedDownload] = useState(false);
  const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  useEffect(() => {
    const fetchMaintenanceReport = async () => {
      try {
        const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/maintenanceReport?projectName=${projectName}`);
        const data = await response.json();
        const uid = data.detailSection[0].uid;
        const detailResponse = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/maintenanceReport/${uid}`);
        const detailData = await detailResponse.json();
        setMaintenanceData(detailData[0]);
        setLoading(false);
      } catch (error) {
        log.error('Error fetching maintenance report:', error);
        setLoading(false);
      }
    };

    fetchMaintenanceReport();
  }, [backendBaseApiUrl, projectName]);

  const getAttachmentForTestCaseSteps = async (attachmentName) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/flowsource/attachments?name=${attachmentName.trim()}`);
      if (!response.ok) throw new Error(response.status);
      const resp = await response.json();
      if (resp.data) {
        setPopUpImage('data:image/png;base64,' + resp.data);
        setFailedDownload(false);
      } else {
        setFailedDownload(true);
      }
    } catch (error) {
      log.info('Error:', error);
      setFailedDownload(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentDownload = async (attachmentName) => {
    log.info('Downloading attachment:', attachmentName); // Log the attachment name
    setShowModal(true);
    getAttachmentForTestCaseSteps(attachmentName);
  };

  function renderMaintainceStatusPage() {
    if(isLoading) {
      return(        
        <div className={`App p-3 ${classes.loading1} `}>
          Loading...
        </div>
      );
    } 
    else if(!maintenanceData) {
      return (
        <div className="card ms-4 me-3 mb-3">
          <div className="card-body">
            <h5 className="card-title">No Data Available</h5>
          </div>
        </div>
      );
    } 
    else {
      return (
        <div className="card ms-4 me-4 mb-3 mt-0">
          <div className="card-body">
            <div className="row ms-5">
              <div className="row ms-5">
                <div className="col-3">
                  <h6 className={`card-title ${classes.cardTitle1}`}>FAILED</h6>
                </div>
                <div className="col-3">
                  <h6 className={`card-title ${classes.cardTitle1}`}>HEALED</h6>
                </div>
                <div className="col-6">
                  <h6 className={`card-title ${classes.cardTitle1}`}>INFO</h6>
                </div>
              </div>
              <div className="row ms-5">
                <img src={failed_healed_info} alt="Failed Icon" className={`img-fluid mb-2 ${classes.customImage}`} />
              </div>
              <div className="row ms-5">
                <div className="col-3">
                  <div className="row">
                    <div className="col">Value: {maintenanceData.failedValue}</div>
                  </div>
                  <div className="row">
                    <div className="col">Type: {maintenanceData.failedType}</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="row">
                    <div className="col">Value: {maintenanceData.healedValue}</div>
                  </div>
                  <div className="row">
                    <div className="col">Type: {maintenanceData.healedType}</div>
                  </div>
                </div>
                <div className="col-5">
                  <div className="row">
                    <div className="col">Suite: {maintenanceData.suiteName}</div>
                  </div>
                  <div className="row">
                    <div className="col">TestCase: {maintenanceData.testCaseName}</div>
                  </div>
                  <div className="row">
                    <div className="col">Class: {maintenanceData.className}</div>
                  </div>
                  <div className="row">
                    <div className="col">Method: {maintenanceData.methodName}</div>
                  </div>
                  <div className="row">
                    <div className="col">FileName: {maintenanceData.fileName}</div>
                  </div>
                  <div className="row">
                    <div className="col">LineNumber: {maintenanceData.lineNumber}</div>
                  </div>
                  <div className="row">
                    <div className="col">
                      Attachment: <a href='#'><img src={attachment_icon} alt="Attachment Icon" onClick={() => handleAttachmentDownload(maintenanceData.attachment.name)} /></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  function renderDownloadAttachmentPopUp() {
    if(isLoading) {
      return (
        <div className={`App p-3 ${classes.loading1} `}>
          Loading...
        </div>
      );
    } 
    else if(isFailedDownload) {
      return (
        <div className={`App p-3 ${classes.loading1} `}>
          Error occurred while downloading the file
        </div>
      );
    } 
    else {
      return(
        <div>
          <img src={popUpImage} alt="attachment" className={`${classes.modalimg}`}/>
        </div>
      );
    }
  }

  return (
    <>
      { renderMaintainceStatusPage() }

      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body className={`${classes.modalbody}`}>
          <div>
            <div className={`row ${classes.rowButton}`}>
              { renderDownloadAttachmentPopUp() }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setShowModal(false)} className={`${classes.Footer}`}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MaintenanceStatus;