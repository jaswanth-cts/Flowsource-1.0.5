CREATE SCHEMA IF NOT EXISTS fs_data_engine;

-----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fs_data_engine.ci_prod_deployment_data  (
    id STRING NOT NULL,
    appid STRING NOT NULL,
    deployment_job STRING,
    short_description STRING,
    build_number STRING ,
    build_status STRING,
    build_timestamp BIGINT,
    build_url STRING,
    flowsource_time BIGINT,
    flowsource_timeX STRING,
    tool_name STRING,
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, build_number, deployment_job) NOT ENFORCED
);


------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fs_data_engine.alm_changes_data (
    id STRING NOT NULL,
    appid STRING NOT NULL ,
    project_key STRING,
    issue_key STRING,
    status STRING,
    done_date BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, project_key, issue_key) NOT ENFORCED
);

------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fs_data_engine.scm_commit_data (
    id STRING NOT NULL,
    appid STRING NOT NULL ,
    commit_id STRING,
    commit_message STRING,
    author STRING,
	branch STRING,
	commit_time BIGINT,
    lead_time BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    PRIMARY KEY(appid, commit_id) NOT ENFORCED
);

--------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fs_data_engine.scm_leadtime_data (
  	id STRING,
    appid STRING,
    story_id STRING,
    commit_id STRING,
	commit_timestamp BIGINT,
    story_last_updated BIGINT,
    lead_time_in_days INT,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
    tool_name STRING,
    engine_execution_time BIGINT,
  	PRIMARY KEY(appid, story_id, commit_id) NOT ENFORCED
);
	
-------------------------------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS fs_data_engine.apm_event_data (
  	id STRING,
    appid STRING,
    event_id STRING,
    event_date BIGINT,
    recovery_time INT,
    environment STRING,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, event_id) NOT ENFORCED
);

------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fs_data_engine.itsm_incident_data (
    id STRING NOT NULL,
    appid STRING,
	incident_number STRING,
    deployment_id STRING,
    priority STRING,
	opened_date BIGINT,
    closed_date BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    engine_execution_time BIGINT,
    incident_state STRING,
	PRIMARY KEY(appid, incident_number, incident_state) NOT ENFORCED
);

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fs_data_engine.codequality_metrics_data (
    id STRING NOT NULL,
    appid STRING,
	scan_id STRING,
    high_issues INT,
	medium_issues INT,
	low_issues INT,
	info_issues INT,
	scan_date STRING,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, scan_id) NOT ENFORCED
);

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fs_data_engine.sca_metrics_data (
    id STRING NOT NULL,
    appid STRING,
	version_id STRING,
    high_issues INT,
    critcal_issues INT,
	medium_issues INT,
	low_issues INT,
	info_issues INT,
	scan_date STRING,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, version_id) NOT ENFORCED
);

---------------------------------------------------------------------------------------------------------------------------------

 CREATE TABLE IF NOT EXISTS fs_data_engine.apm_resilience_data (
    id STRING NOT NULL,
    appid STRING,
	assessment_name STRING,
    assesment_start_time BIGINT,
	resilience_score STRING,
	compliance_status STRING,
	flowsource_time BIGINT,
	flowsource_timeX STRING,
	tool_name STRING,
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, assessment_name) NOT ENFORCED
);

---------------------------------------------------------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS fs_data_engine.catalog_data (
    appid STRING,
    app_name STRING,
    annotations STRING,
	lob STRING,
	is_critical STRING,
    engine_execution_time BIGINT,
    PRIMARY KEY (appid) NOT ENFORCED
);