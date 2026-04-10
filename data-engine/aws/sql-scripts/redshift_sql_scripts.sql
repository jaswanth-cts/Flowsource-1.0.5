CREATE SCHEMA IF NOT EXISTS flowsource;

-----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flowsource.ci_prod_deployment_data  (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255) NOT NULL DISTKEY,
    deployment_job VARCHAR(255),
    short_description VARCHAR(255),
    build_number VARCHAR(255) ,
    build_status VARCHAR(255),
    build_timestamp BIGINT,
    build_url VARCHAR(1000),
    flowsource_time BIGINT,
    flowsource_timeX VARCHAR(255),
    tool_name VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, build_number, deployment_job)
)
SORTKEY (appid, build_timestamp);


------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.alm_changes_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255) NOT NULL DISTKEY,
    project_key VARCHAR(255),
    issue_key VARCHAR(255),
    status VARCHAR(255),
    done_date BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, project_key, issue_key)
)
SORTKEY (appid, project_key, issue_key);

------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.scm_commit_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255) NOT NULL DISTKEY,
    commit_id VARCHAR(255),
    commit_message VARCHAR(255),
    author VARCHAR(255),
	branch VARCHAR(255),
	commit_time BIGINT,
    lead_time BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    PRIMARY KEY(appid, commit_id)
)
SORTKEY (appid, commit_id);

--------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.scm_leadtime_data (
  	id VARCHAR(255),
    appid VARCHAR(255),
    story_id VARCHAR(255),
    commit_id VARCHAR(255),
	commit_timestamp BIGINT,
    story_last_updated BIGINT,
    lead_time_in_days INT,
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
    tool_name VARCHAR(255),
    engine_execution_time BIGINT,
  	PRIMARY KEY(appid, story_id, commit_id)
)
SORTKEY (appid, commit_id);
	
-------------------------------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS flowsource.apm_event_data (
  	id VARCHAR(255),
    appid VARCHAR(255),
    event_id VARCHAR(255),
    event_date BIGINT,
    recovery_time INT,
    environment VARCHAR(255),
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, event_id)
)
SORTKEY (appid, event_id);

------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.itsm_incident_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255),
	incident_number VARCHAR(255),
    deployment_id VARCHAR(255),
    priority VARCHAR(255),
	opened_date BIGINT,
    closed_date BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
    incident_state VARCHAR(255),
	PRIMARY KEY(appid, deployment_id, incident_state)
)
SORTKEY (appid, deployment_id);

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.codequality_metrics_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255),
	scan_id VARCHAR(255),
    high_issues INT,
	medium_issues INT,
	low_issues INT,
	info_issues INT,
	scan_date VARCHAR(255),
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, scan_id)
)
SORTKEY (appid, scan_id);

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.sca_metrics_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255),
	version_id VARCHAR(255),
    high_issues INT,
    critcal_issues INT,
	medium_issues INT,
	low_issues INT,
	info_issues INT,
	scan_date VARCHAR(255),
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, version_id)
)
SORTKEY (appid, version_id);

---------------------------------------------------------------------------------------------------------------------------------

 CREATE TABLE IF NOT EXISTS flowsource.apm_resilience_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255),
	assessment_name VARCHAR(255),
    assesment_start_time BIGINT,
	resilience_score VARCHAR(255),
	compliance_status VARCHAR(255),
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, assessment_name)
)
SORTKEY (appid, assessment_name);

---------------------------------------------------------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS flowsource.catalog_data (
    appid VARCHAR(255),
    app_name VARCHAR(255),
    annotations VARCHAR(5000),
	lob VARCHAR(255),
	is_critical VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY (appid)
)
SORTKEY (appid, is_critical);

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.catalog_data_staging (
    appid VARCHAR(255),
    app_name VARCHAR(255),
    annotations VARCHAR(5000),
	lob VARCHAR(255),
	is_critical VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY (appid)
)
SORTKEY (appid, is_critical);