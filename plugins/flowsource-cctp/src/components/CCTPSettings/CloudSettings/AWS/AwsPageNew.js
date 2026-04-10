import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import cssClasses from '../CloudSettingsCssPage.js';
import { Modal } from 'react-bootstrap';
import add_icon from '../../../Icons/add_icon.png';
import minus_icon from '../../../Icons/minus_icon.png';
import close_icon from '../../../Icons/popup_close_icon.png';
import xss from 'xss';

import log from 'loglevel';

const AwsPageNew = (props) => {
  const { fetch } = useApi(fetchApiRef);
const config = useApi(configApiRef);
const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';
const classes = cssClasses();
const [isApiError, setIsApiError] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const [nameExists, setNameExists] = useState(false);
const [formData, setFormData] = useState({
  serviceType: 'STATIC', // Set initial state to STATIC
  region: '',
  clusterName: 'leap-robots-fg',
  serviceName: '',
  dynamicName: '',
  robotName: '',
  taskDefinition: ''
});

const [isFieldEmpty, setIsFieldEmpty] = useState({
  serviceType: false,
  region: true,
  clusterName: false,
  serviceName: true,
  dynamicName: true,
  robotName: true,
  taskDefinition: true
});

const [showModal, setShowModal] = useState(false);
const [modalInputFields, setModalInputFields] = useState([{ id: 1, value: '' }]);
const [error, setError] = useState(null);
const [showErrorDialog, setShowErrorDialog] = useState(false);
const [navigateBack, setNavigateBack] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [warningMessage, setWarningMessage] = useState('');
const [disabled, setDisabled] = useState(true);

useEffect(() => {
  if (props.awsServiceId) {
    fetchServiceDetails(props.awsServiceId);
  }
}, [props.awsServiceId]);

const fetchServiceDetails = async (id) => {
  try {
    const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/cloud/aws/robots/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      const formattedError = `HTTP error! status: ${response.status}, message: Error fetching service details`;
      setError(formattedError);
      setShowErrorDialog(true);
      setNavigateBack(true);
    } else {
      const data = await response.json();
      const formDataFetched = {
        serviceType: data.type,
        region: data.zone,
        clusterName: data.cluster,
        serviceName: data.name,
        dynamicName: data.dynamicName,
        robotName: data.awsRobotName,
        taskDefinition: data.taskDefinition,
      };
      setFormData(formDataFetched);
      setIsFieldEmpty({
        serviceType: false,
        region: !data.zone,
        clusterName: !data.cluster,
        serviceName: !data.name,
        dynamicName: !data.dynamicName,
        robotName: !data.awsRobotName,
        taskDefinition: !data.taskDefinition
      });
    }
  } catch (error) {
    log.error('Error fetching service details:', error);
    setError(`Error fetching service details.`);
    setShowErrorDialog(true);
    setNavigateBack(true);
  }
};

const handleFieldChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
  setIsFieldEmpty((prevState) => ({
    ...prevState,
    [name]: value.trim() === '',
  }));
};

const handleModalInputChange = (id, field, value) => {
  setModalInputFields(
    modalInputFields.map((item) => (item.id === id ? { ...item, [field]: value } : item))
  );
};

const handleAddModalInputField = () => {
  setModalInputFields([...modalInputFields, { id: modalInputFields.length + 1, label: '', value: '' }]);
};

const handleRemoveModalInputField = (id) => {
  setModalInputFields(modalInputFields.filter((field) => field.id !== id));
};

const handleModalDone = () => {
  const values = modalInputFields.map((field) => `${field.label}:${field.value}`).join(', ');
  setFormData((prevData) => ({ ...prevData, config: values }));
  setShowModal(false);
};

const openModal = () => {
  const modalFields =
    typeof formData.config === 'string'
      ? formData.config.split(', ').map((item, index) => {
        const [label, value] = item.split(':');
        return { id: index + 1, label, value };
      })
      : [];
  setModalInputFields(modalFields);
  setShowModal(true);
};

const handleCreateOrUpdate = async (event) => {
  event.preventDefault();

  if (formData.serviceType === 'STATIC') {
    if (formData.region === '') {
      setErrorMessage("Validation Error: Region is required. Field can't be empty.");
      setIsApiError(true);
      return;
    }
    if (formData.clusterName === '' || formData.clusterName.length < 4) {
      setErrorMessage("Validation Error: Cluster Name is required and should have at least 4 characters.");
      setIsApiError(true);
      return;
    }
    if (formData.serviceName === '') {
      setErrorMessage("Validation Error: Service Name is required. Field can't be empty.");
      setIsApiError(true);
      return;
    }
  } else {
    if (formData.region === '') {
      setErrorMessage("Validation Error: Region is required. Field can't be empty.");
      setIsApiError(true);
      return;
    }
    if (formData.clusterName === '' || formData.clusterName.length < 4) {
      setErrorMessage("Validation Error: Cluster Name is required and should have at least 4 characters.");
      setIsApiError(true);
      return;
    }
    if (formData.dynamicName === '') {
      setErrorMessage("Validation Error: Dynamic Name is required. Field can't be empty.");
      setIsApiError(true);
      return;
    }
    if (formData.robotName === '') {
      setErrorMessage("Validation Error: Robot Name is required. Field can't be empty.");
      setIsApiError(true);
      return;
    }
    if (formData.taskDefinition === '') {
      setErrorMessage("Validation Error: Task Definition is required. Field can't be empty.");
      setIsApiError(true);
      return;
    }
  }

  const newFormDataCreate = {
    type: formData.serviceType,
    name: formData.serviceType === 'STATIC' ? formData.serviceName : formData.dynamicName,
    tasks: 0,
    cluster: formData.clusterName,
    zone: formData.region,
    dynamicName: formData.dynamicName,
    awsRobotName: formData.robotName,
    taskDefinition: formData.taskDefinition,
    createdOn: null,
    lastUpdatedOn: null,
  };

  const newFormDataUpdate = {
    id: props.awsServiceId,
    type: formData.serviceType,
    name: formData.serviceType === 'STATIC' ? formData.serviceName : formData.dynamicName,
    tasks: 0,
    cluster: formData.clusterName,
    zone: formData.region,
    dynamicName: formData.dynamicName,
    awsRobotName: formData.robotName,
    taskDefinition: formData.taskDefinition,
    createdOn: null,
    lastUpdatedOn: null,
  };

  const sanitizedCreatePayload = xss(JSON.stringify(newFormDataCreate));
  const sanitizedUpdatePayload = xss(JSON.stringify(newFormDataUpdate));

  try {
    const url = `${backendBaseApiUrl}cctp-proxy/execution/cloud/aws/robots/`;
    const method = props.awsServiceId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: props.awsServiceId ? sanitizedUpdatePayload : sanitizedCreatePayload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = JSON.parse(errorText).message || errorText;
      setError(`Message: ${errorMessage}`);
      setShowErrorDialog(true);
      log.error('Error saving service: API returned: ', errorMessage);
    } else {
      const result = await response.json();
      props.setServiceTableData((prevData) => [...prevData, result]);
      props.setActiveAWSComponent('awsPageMain');
    }
  } catch (error) {
    log.error('Error saving service:', error);
    setError(`Error saving service: ${error.message}`);
    setShowErrorDialog(true);
  }
};

const handleCancel = () => {
  props.setActiveAWSComponent('awsPageMain');
};

const togglePasswordVisibility = () => {
  setShowPassword(!showPassword);
};

const checkIfServiceNameAlreadyTaken = async (event, serviceName) => {
  try {
    setNameExists(false); 
    const name = serviceName ? serviceName.trim() : event.target.value.trim();
    const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/cloud/aws/robots/search/?name=${name}`);
    if (response.status === 200) {
      const data = await response.json();
      setNameExists(true);
    } else if (response.status === 404) {
      setNameExists(false);
    } else {
      log.error("Unexpected response status:", response.status);
      setNameExists(false);
    }
  } catch (error) {
    log.error('Error in checkIfServiceNameAlreadyTaken function: ', error);
  }
};

  
  return (
    <div>
      <div className={`w-80 mt-2 ${classes.parentDiv}`}>
      <div className={`${classes.newFrameworkTitle}`}>
        {props.awsServiceId ? 'Update Service' : 'Create New AWS Service'}
      </div>
      <form className={`${classes.form}`} onSubmit={handleCreateOrUpdate}>
        <div className={`${classes.formGroup}`}>
          <label htmlFor="serviceType" className={`${classes.label}`}>
            Service Type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            className={`${classes.input}`}
            value={formData.serviceType}
            onChange={(e) => {handleFieldChange(e);
              if(e.target.value==='STATIC' )
                { checkIfServiceNameAlreadyTaken (null,formData.serviceName)
                }
                else if (e.target.value==='DYNAMIC' ){
                  checkIfServiceNameAlreadyTaken (null,formData.dynamicName)
                } 
              }}
          >
            <option value="STATIC">STATIC</option>
            <option value="DYNAMIC">DYNAMIC</option>
          </select>
        </div>
        <div className={`${classes.formGroup}`}>
          <label htmlFor="region" className={`${classes.label}`}>
            Region {isFieldEmpty.region && <span style={{ color: 'red' }}>*</span>}
          </label>
          <input
            type="text"
            id="region"
            name="region"
            className={`${classes.input}`}
            onChange={handleFieldChange}
            value={formData.region}
          />
        </div>
        <div className={`${classes.formGroup}`}>
    <label htmlFor="clusterName" className={`${classes.label}`}>
      Cluster Name {isFieldEmpty.clusterName && <span style={{ color: 'red' }}>*</span>}
    </label>
    <input
      type="text"
      id="clusterName"
      name="clusterName"
      className={`${classes.input}`}
      onChange={handleFieldChange}
      value={formData.clusterName}
    />
  </div>
        {formData.serviceType === 'STATIC' && (
          <div className={classes.formGroup}>
            <label htmlFor="serviceName" className={classes.label}>
              Service Name {isFieldEmpty.serviceName && <span style={{ color: 'red' }}>*</span>}
            </label>
            <input
              type="text"
              id="serviceName"
              name="serviceName"
              className={classes.input}
              onChange={(e) => {
                handleFieldChange(e);
                checkIfServiceNameAlreadyTaken(e,null);
              }}
              value={formData.serviceName}
            />
            {nameExists && (
              <span
              className={`${classes.Servicenamespan}`}
                title="Name already exists"
              >
                Name already exists
              </span>
            )}
          </div>
        )}

        {formData.serviceType === 'DYNAMIC' && (
          <>
            <div className={`${classes.formGroup}`}>
              <label htmlFor="dynamicName" className={`${classes.label}`}>
                Dynamic Name {isFieldEmpty.dynamicName && <span style={{ color: 'red' }}>*</span>}
              </label>
              <input
                type="text"
                id="dynamicName"
                name="dynamicName"
                className={`${classes.input}`}
                onChange={(e) => {
                  handleFieldChange(e);
                  checkIfServiceNameAlreadyTaken(e,null);
                }}
                value={formData.dynamicName}
              />
            </div>
            {nameExists && (
              <span
              className={`${classes.ClusternameSpan}`}
                title="Name already exists"
              >
                Name already exists
              </span>
            )}
            <div className={`${classes.formGroup}`}>
              <label htmlFor="robotName" className={`${classes.label}`}>
                Robot Name {isFieldEmpty.robotName && <span style={{ color: 'red' }}>*</span>}
              </label>
              <input
                type="text"
                id="robotName"
                name="robotName"
                className={`${classes.input}`}
                onChange={handleFieldChange}
                value={formData.robotName}
              />
            </div>
            <div className={`${classes.formGroup}`}>
              <label htmlFor="taskDefinition" className={`${classes.label}`}>
                Task Definition {isFieldEmpty.taskDefinition && <span style={{ color: 'red' }}>*</span>}
              </label>
              <input
                type="text"
                id="taskDefinition"
                name="taskDefinition"
                className={`${classes.input}`}
                onChange={handleFieldChange}
                value={formData.taskDefinition}
              />
            </div>
          </>
        )}
        <div className={`${classes.buttonContainer}`}>
          <button type="submit" className={nameExists ? classes.disableButton : classes.createEnvironmentButton} disabled={nameExists}>
            {props.awsServiceId ? 'UPDATE' : 'CREATE'}
          </button>
          <button type="button" onClick={handleCancel} className={`${classes.submitCancelButton}`}>
            CANCEL
          </button>
        </div>
      </form>
      {isApiError && (
        <div className={`${classes.popUpErrorBox}`}>
          <div className={`${classes.popUpErrorBoxCard}`}>
            <div className={`card ms-2 me-2 mb-2 mt-2 w`}>
              <div className={`card-header`}>
                <h6>Error Occurred</h6>
              </div>
              <div className={`card-body`}>
                <div className={`alert alert-danger`} role="alert">
                  {errorMessage}
                </div>
              </div>
            </div>
            <button className={`${classes.popUpErrorBoxButton}`}
              onClick={() => {
                setIsApiError(false);
                if (navigateBack) {
                  props.setActiveTab('environments');
                }
              }} >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title className={`${classes.modalTitle}`}>Default Tool Config</Modal.Title>
          <img src={close_icon} alt="Close" className={`${classes.closeIcon}`} onClick={() => setShowModal(false)} />
        </Modal.Header>
        <Modal.Body className={`${classes.modalBody}`}>
          {modalInputFields.map((field, index) => {
            return (
              <div key={field.id} className="formGroup" style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  id={`label-${index + 1}`}
                  name={`label-${index + 1}`}
                  className={`${classes.modalInputLeft}`}
                  value={field.label}
                  onChange={(e) => handleModalInputChange(field.id, 'label', e.target.value)}
                  placeholder={`Config-${index + 1}`}
                />
                <input
                  type="text"
                  id={`value-${index + 1}`}
                  name={`value-${index + 1}`}
                  className={`${classes.modalInputRight}`}
                  value={field.value}
                  onChange={(e) => handleModalInputChange(field.id, 'value', e.target.value)}
                />
                <button type="button" onClick={handleAddModalInputField} className={`${classes.addRemoveButton}`}>
                  <img src={add_icon} alt="Add" />
                </button>
                {modalInputFields.length > 1 && (
                  <button type="button" onClick={() => handleRemoveModalInputField(field.id)} className={`${classes.addRemoveButton}`}>
                    <img src={minus_icon} alt="Remove" />
                  </button>
                )}
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <div className={`${classes.modalButtonContainer}`}>
            <button type="button" className={`${classes.modalDoneButton}`} onClick={handleModalDone}>
              DONE
            </button>
            <button type="button" onClick={() => setShowModal(false)} className={`${classes.modalCancelButton}`}>
              CANCEL
            </button>
          </div>
        </Modal.Footer>
      </Modal>
      {/* Error Dialog */}
      {showErrorDialog && (
        <div className={`${classes.dialogOverlayError}`}>
          <div className={`${classes.dialogBoxError}`}>
            <div className="card ms-2 me-2 mb-2 mt-2 w">
              <div className="card-header">
                <h6>Validation</h6>
              </div>
              <div className="card-body">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </div>
            </div>
            <button
              className={`${classes.errorDialogBoxButton}`}
              onClick={() => {
                setShowErrorDialog(false);
                if (navigateBack) {
                  props.setActiveTab('frameworks');
                }
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwsPageNew;
