CREATE SCHEMA IF NOT EXISTS flowsource;

-----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flowsource.ci_prod_deployment_data  (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255) NOT NULL,
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
)USING COLUMNAR;


------------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.alm_changes_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255) NOT NULL,
    project_key VARCHAR(255),
    issue_key VARCHAR(255),
    status VARCHAR(255),
    done_date BIGINT,
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY(appid, project_key, issue_key)
)USING COLUMNAR;

------------------------------------------------------------------------------------------------------------------------------------


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
)USING COLUMNAR;
	
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
)USING COLUMNAR;

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
	PRIMARY KEY(appid, incident_number, incident_state)
)USING COLUMNAR;

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
)USING COLUMNAR;

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.sca_metrics_data (
    id VARCHAR(255) NOT NULL,
    appid VARCHAR(255),
	version_id VARCHAR(255),
    high_issues INT,
    critical_issues INT,
	medium_issues INT,
	low_issues INT,
	info_issues INT,
	scan_date VARCHAR(255),
	flowsource_time BIGINT,
	flowsource_timeX VARCHAR(255),
	tool_name VARCHAR(255),
    engine_execution_time BIGINT,
	PRIMARY KEY(appid, version_id)
)USING COLUMNAR;

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
)USING COLUMNAR;

---------------------------------------------------------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS flowsource.catalog_data (
    appid VARCHAR(255),
    app_name VARCHAR(255),
    annotations VARCHAR(5000),
	lob VARCHAR(255),
	is_critical VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY (appid)
);

---------------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flowsource.catalog_data_staging (
    appid VARCHAR(255),
    app_name VARCHAR(255),
    annotations VARCHAR(5000),
	lob VARCHAR(255),
	is_critical VARCHAR(255),
    engine_execution_time BIGINT,
    PRIMARY KEY (appid)
);

---------------------------------------------------------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS flowsource.cloud_provider_location_data  (
    region VARCHAR(50),
    location VARCHAR(255),
    cloud_platform VARCHAR(50),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    PRIMARY KEY(region,location,cloud_platform)
);

---------------------------------------------------------------------------------------------------------------------------------


CREATE TABLE flowsource.activity_output (
	"output" varchar(255) 
);