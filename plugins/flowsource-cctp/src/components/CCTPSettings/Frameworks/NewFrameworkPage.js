import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';

import cssClasses from './FrameworkPageCss.js';
import { Modal } from 'react-bootstrap';
import edit_icon from '../../Icons/edit_icon.png';
import add_icon from '../../Icons/add_icon.png';
import minus_icon from '../../Icons/minus_icon.png';
import close_icon from '../../Icons/popup_close_icon.png';
import xss from 'xss';

import log from 'loglevel';

const NewFrameworksPage = (props) => {

  const classes = cssClasses();
  const [nameExists, setNameExists] = useState(false);
  const [data, setData] = useState({ 
    BuildStep: { 
      Unix: [{ id: 1, value: '' }], 
      Windows: [{ id: 1, value: '' }] 
    }, 
    ExecutionStep: { 
      Unix: [{ id: 1, value: '' }], 
      Windows: [{ id: 1, value: '' }] 
    } 
  }); 
  const [selectedButton, setSelectedButton] = useState('BuildStep'); 
  const [selectedType, setSelectedType] = useState('Unix'); 
  const [inputFields, setInputFields] = useState([{ id: 1, value: '' }]);
  const [configValues, setConfigValues] = useState('');
  const [configObject, setConfigObject] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    config: '', 
    pattern: '', 
    separator: '', 
    buildSteps: { 
        Unix: [], 
        Windows: [] 
    }, 
    executionSteps: { 
        Unix: [], 
        Windows: [] 
    } 
  }); 
  const [showModal, setShowModal] = useState(false);
  const [modalInputFields, setModalInputFields] = useState([{ id: 1, label: '', value: '' }]);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);
  
  const { fetch } = useApi(fetchApiRef);
  const config = useApi(configApiRef);
  const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

  const getButtonStyles = (buttonState, selectedButton) => ({
    backgroundColor: selectedButton === buttonState ? '#000048' : 'transparent',
    color: selectedButton === buttonState ? 'white' : '#000048',
    border: `1px solid #000048`,
    height: '28px',
    borderRadius: '0', 
  });

  const handleButtonClick = (step) => { 
    persistInputFields(selectedButton, selectedType); 
    setSelectedButton(step); 
    setInputFields(retrieveInputFields(step, selectedType));
  };

  const handleTypeChange = (e) => { 
    persistInputFields(selectedButton, selectedType); 
    const newType = e.target.value; 
    setSelectedType(newType); 
    setInputFields(retrieveInputFields(selectedButton, newType));
  };

  const handleAddInputField = () => { 
    setInputFields([...inputFields, { id: inputFields.length + 1, value: '' }]); 
  }; 
  
  const handleRemoveInputField = (id) => { 
    setInputFields(inputFields.filter(field => field.id !== id)); 
  }; 
  
  const handleInputChange = (id, value) => { 
    const updatedFields = inputFields.map(field => field.id === id ? { ...field, value } : field);
    setInputFields(updatedFields);
  };
  
  const persistInputFields = (step, type) => { 
    const newData = { 
      ...data, 
      [step]: { 
        ...data[step], 
        [type]: inputFields 
      } 
    };
  
    setData(newData); 
  };
  
  
  const retrieveInputFields = (step, type) => { 
    return data[step][type] && data[step][type].length > 0 ? data[step][type] : [{ id: 1, value: '' }];
  };  

  const handleModalInputChange = (id, field, value) => {
    setModalInputFields(prevFields =>
      prevFields.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };  
  
  const handleAddModalInputField = () => { 
    setModalInputFields([...modalInputFields, { id: modalInputFields.length + 1, label: '', value: '' }]); 
  };   
  
  const handleRemoveModalInputField = (id) => { 
    setModalInputFields(modalInputFields.filter(field => field.id !== id));
  };

  const handleNameFieldChange = async (e) => { 
    const { name, value } = e.target; 
    setFormData(prevData => ({ ...prevData, [name]: value })); 
    
    if (name === 'name') { 
      const exists = await checkNameExists(value); 
      setNameExists(exists); 
    } 
  };  

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'config') {
      try {
        const fields = value.split(', ').map((item, index) => {
          const separatorIndex = item.indexOf(':');
          const label = item.substring(0, separatorIndex);
          const value = item.substring(separatorIndex + 1); // Skip the colon
          return { id: index + 1, label, value };
        });
        setModalInputFields(fields);
        setConfigObject(fields);
      } catch (error) {
        log.error('Error parsing config value:', error);
      }
    }
  
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleModalDone = () => {
    const values = modalInputFields.map(field => `${field.label}:${field.value}`).join('; ');
    setConfigValues(values);
    setConfigObject(modalInputFields);
    setShowModal(false);
  };

  const openModal = () => {
    if (configObject.length > 0) {
      setModalInputFields(configObject);
    } else {
      // If configObject is empty, initialize with a default empty field
      setModalInputFields([{ id: 1, label: '', value: '' }]);
    }
    setShowModal(true);
  };
  
  const handleCreate = async (event) => {
    event.preventDefault();
  
    persistInputFields(selectedButton, selectedType); // Save the current input fields before creating the framework
  
    const newFormData = {
      ...formData,
      config: configValues, // Include config values
      buildSteps: {
        Unix: data.BuildStep.Unix.map(step => step.value), // Ensure we only send the values
        Windows: data.BuildStep.Windows.map(step => step.value)
      },
      executionSteps: {
        Unix: data.ExecutionStep.Unix.map(step => step.value),
        Windows: data.ExecutionStep.Windows.map(step => step.value)
      }
    };
  
    setFormData(newFormData);
  
    // Parse the config string into properties object
    const properties = configObject.reduce((acc, config) => {
      acc[config.label] = config.value;
      return acc;
    }, {});
  
    const createPayload = {
      name: newFormData.name,
      pattern: newFormData.pattern,
      separator: newFormData.separator,
      buildStepsDetails: {
        windows: newFormData.buildSteps.Windows,
        unix: newFormData.buildSteps.Unix
      },
      executionStepsDetails: {
        windows: newFormData.executionSteps.Windows,
        unix: newFormData.executionSteps.Unix
      },
      properties: properties,
      config: newFormData.config
    };
  
    const updatePayload = {
      id: props.frameworkId,
      name: newFormData.name,
      pattern: newFormData.pattern,
      separator: newFormData.separator,
      buildStepsDetails: {
        windows: newFormData.buildSteps.Windows,
        unix: newFormData.buildSteps.Unix
      },
      executionStepsDetails: {
        windows: newFormData.executionSteps.Windows,
        unix: newFormData.executionSteps.Unix
      },
      properties: properties,
      config: newFormData.config
    };

    const sanitizedCreatePayload = xss(JSON.stringify(createPayload));
    const sanitizedUpdatePayload = xss(JSON.stringify(updatePayload));

    try {

      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/tool-config/`, {
        method: props.frameworkId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: props.frameworkId ? sanitizedUpdatePayload : sanitizedCreatePayload
      });
    
  
      if (!response.ok) {
        const errorText = await response.text();
        const formattedError = `HTTP error: status: ${response.status}, message: Error saving framework`;
        setError(formattedError);
        setShowErrorDialog(true);
        log.error('Error saving framework: API returned: ', errorText);
      } else {
        const result = await response.json();
        log.info('Framework saved successfully:', result);
        props.setActiveTab('frameworks');
      }
  
    } catch (error) {
      log.error('Error saving framework:', error);
      setError(`Error saving framework: ${error.message}`);
      setShowErrorDialog(true);
    }
  };

  const handleCancel = () => {
    props.setActiveTab('frameworks');
    setInputFields([{ id: 1, value: '' }]); 
  };

  const checkNameExists = async (name) => { 
    try { 
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/tool-config/search/?name=${name}`);  
      
      if (response.status === 200) { 
        return true; 
      } else if (response.status === 404) { 
        return false; 
      } else { 
        // Handle other status codes or errors 
        log.error("Unexpected response status:", response.status); 
        return false; 
      } 
    } catch (error) { 
      log.error("Error checking name:", error); 
      return false; 
    }
  };

  //------------------------------Edit Framework--------------------------------

  // Fetch details if editing an existing framework 
  useEffect(() => { 
    if (props.frameworkId) { 
      fetchFrameworkDetails(props.frameworkId); 
    } 
  }, [props.frameworkId]);

  useEffect(() => { 
    persistInputFields(selectedButton, selectedType); 
  }, [inputFields]);
  
  const fetchFrameworkDetails = async (id) => {
    log.info("Fetching framework details for id:", id);
    try {
      const response = await fetch(`${backendBaseApiUrl}cctp-proxy/execution/tool-config/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        const formattedError = `HTTP error! status: ${response.status}, message: Error fetching framework details`;
        setFetchError(formattedError);
        setShowErrorDialog(true);
        setNavigateBack(true);  // Indicate that navigation should happen after closing the dialog
        log.error('Error fetching framework details: API returned: ', errorText);
      } else {
        const data = await response.json(); // Pre-populate form fields with existing data
  
        const configArray = Object.entries(data.properties).map(([key, value], index) => ({
          id: index + 1,
          label: key,
          value: value
        }));
        const configString = configArray.map(item => `${item.label}:${item.value}`).join('; ');
  
        const formDataFetched = {
          name: data.name,
          config: configString,
          pattern: data.pattern,
          separator: data.separator,
          buildSteps: {
            Unix: data.buildStepsDetails.unix.map((step, index) => ({ id: index + 1, value: step, })),
            Windows: data.buildStepsDetails.windows.map((step, index) => ({ id: index + 1, value: step, })),
          },
          executionSteps: {
            Unix: data.executionStepsDetails.unix.map((step, index) => ({ id: index + 1, value: step, })),
            Windows: data.executionStepsDetails.windows.map((step, index) => ({ id: index + 1, value: step, })),
          }
        };
  
        setFormData(formDataFetched);
        setConfigValues(configString);
        setConfigObject(configArray);
  
        const stepsData = {
          BuildStep: {
            Unix: data.buildStepsDetails.unix.map((step, index) => ({ id: index + 1, value: step, })),
            Windows: data.buildStepsDetails.windows.map((step, index) => ({ id: index + 1, value: step, })),
          },
          ExecutionStep: {
            Unix: data.executionStepsDetails.unix.map((step, index) => ({ id: index + 1, value: step, })),
            Windows: data.executionStepsDetails.windows.map((step, index) => ({ id: index + 1, value: step, })),
          }
        };
  
        setData(stepsData);
        setInputFields(stepsData.BuildStep.Unix);
      }
  
    } catch (error) {
      log.error('Error fetching framework details:', error);
      setFetchError(`Error fetching framework details.`);
      setShowErrorDialog(true);
      setNavigateBack(true);  // Indicate that navigation should happen after closing the dialog
    }
  }


  function getButtonStyleCss() {
    if(nameExists === true) {
      return `${classes.disableButton}`;
    } else {
      return `${classes.submitCancelButton}`;
    }
  }

  return (
    <div>
      <div className={`w-80 mt-2 ${classes.parentDiv}`}>
        <div className={`${classes.newFrameworkTitle}`}> 
          {props.frameworkId ? 'Update Framework' : 'Create Framework'}
        </div>
        <form className={`${classes.form}`} onSubmit={handleCreate}>
          <div className={`${classes.formGroup}`}>
            <label htmlFor="name" className={`${classes.label}`}>Name</label>
            <input type="text" id="name" name="name" className={`${classes.input}`}
             onChange={handleNameFieldChange} placeholder="Tool Name" value={formData.name}/>
            {nameExists && (
              <div className={`${classes.errorIcon}`} title="Name already exists">
                <p>Name already exists</p>
              </div>
            )}
          </div>
          <div className={`${classes.formGroup}`}> 
            <label htmlFor="config" className={`${classes.label} ${classes.grayLabel}`}>Config</label> 
            <div className={`${classes.inputWrapper}`}> 
              <input type="text" id="config" name="config" className={`${classes.input_config}`}
               value={configValues} onChange={handleFieldChange} readOnly /> 
              <img src={edit_icon} alt="Edit" className={`${classes.editIcon}`} onClick={openModal} /> 
            </div> 
          </div>
          <div className={`${classes.formGroup}`}>
            <label htmlFor="pattern" className={`${classes.label}`}>Pattern</label>
            <input type="text" id="pattern" name="pattern" className={`${classes.input}`}
             onChange={handleFieldChange} value={formData.pattern} />
          </div>
          <div className={`${classes.formGroup} seperator`}>
            <label htmlFor="separator" className={`${classes.label}`}>Separator</label>
            <input type="text" id="separator" name="separator" className={`${classes.input}`}
             onChange={handleFieldChange} value={formData.separator} />
          </div>
          <hr className={`${classes.horizontalLine}`} />
          <div className={`col-auto ${classes.marginbottom1}  ${classes.marginleft15}`}>
            <button 
              type="button"
              className={`${classes.buttonStyleNewFramework}`}
              style={getButtonStyles('BuildStep', selectedButton)}
              onClick={() => handleButtonClick('BuildStep')}>
                BUILD STEPS
            </button>
            <button 
              type="button"
              className={`${classes.buttonStyleNewFramework}`}
              style={getButtonStyles('ExecutionStep', selectedButton)}
              onClick={() => handleButtonClick('ExecutionStep')}>
                EXECUTION STEPS
            </button>
          </div>
          <div className={`${classes.formGroup}`}>
            <label htmlFor="type" className={`${classes.dropdownLabel}`}>Type</label>
            <select id="type" name="type" className={`${classes.dropdown}`} value={selectedType} onChange={handleTypeChange}>
              <option value="Unix">Unix</option>
              <option value="Windows">Windows</option>
            </select>
          </div>
          {inputFields.map((field, index) => (
            <div key={field.id} className={`${classes.formGroup}`}>
              <input type="text" className={`${classes.stepInput}`} value={field.value} onChange={(e) => handleInputChange(field.id, e.target.value)} />
              <button type="button" onClick={handleAddInputField} className={`${classes.addRemoveButton}`}>
                <img src={add_icon} alt="Add" />
              </button>
              {inputFields.length > 1 && (
                <button type="button" onClick={() => handleRemoveInputField(field.id)} className={`${classes.addRemoveButton}`}>
                  <img src={minus_icon} alt="Remove" />
                </button>
              )}
            </div>
          ))}
          <div className={`${classes.buttonContainer}`}>
            <button type="submit" className={ getButtonStyleCss() }
              disabled={nameExists}
            >
              {props.frameworkId ? 'UPDATE' : 'CREATE'}
            </button>
            <button type="button" onClick={handleCancel} className={`${classes.submitCancelButton}`}>
              CANCEL
            </button>
          </div>
        </form>
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
            <button type="button" className={`${classes.modalDoneButton}`} onClick={handleModalDone}> DONE </button> 
            <button type="button" onClick={() => setShowModal(false)} className={`${classes.modalCancelButton}`}> CANCEL </button> 
          </div> 
        </Modal.Footer> 
      </Modal>
      {/* Error Dialog */} 
      {showErrorDialog && ( 
        <div className={`${classes.dialogOverlayError}`}> 
          <div className={`${classes.dialogBoxError}`}> 
            <div className="card ms-2 me-2 mb-2 mt-2 w">
              <div className="card-header">
                <h6>Error Occured</h6>
              </div>
              <div className="card-body">
                <div className="alert alert-danger" role="alert">
                {fetchError || error}
                </div>
              </div>
            </div>
            <button className={`${classes.errorDialogBoxButton}`} onClick={() => { setShowErrorDialog(false); if (navigateBack) { props.setActiveTab('frameworks'); } }} > Close </button> 
          </div> 
        </div> 
      )}
    </div>
  );
  
};

export default NewFrameworksPage;
