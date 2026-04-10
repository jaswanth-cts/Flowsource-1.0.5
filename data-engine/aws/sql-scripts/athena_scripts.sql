---------------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.ci_jenkins_data(
	id STRING,
	appid STRING,
    buildNumber STRING,
    buildUrl STRING,
    jobName STRING,
    result STRING,
    shortDescription STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING,
	buildTimestamp BIGINT	
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/ci-jenkins/'
TBLPROPERTIES ('has_encrypted_data'='false');

---------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.codequality_metrics_data (
    id STRING,
    appid STRING,
    scanId STRING,
    highSeverity INT,
    mediumSeverity INT,
    lowSeverity INT,
    infoSeverity INT,
    scanFinishedOn STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/codequality-checkmarx/'
TBLPROPERTIES ('has_encrypted_data'='false');

---------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.alm_jira_data (
    id STRING,
    appid STRING,
    lastUpdated BIGINT,
    projectKey STRING,
    key STRING,
    toolName STRING,
    summary STRING,
    creationDate STRING,
    priority STRING,
    commits ARRAY<STRUCT<id: STRING, timestamp: BIGINT>>,
    projectName STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    status STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/alm-jira/'
TBLPROPERTIES ('has_encrypted_data'='false');

------------------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.apm_datadog_data (
    id STRING,
    appid STRING,
    eventId STRING,
    eventOccurDateEpoch BIGINT,
    eventStatus STRING,
    toolName STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    recoverTimeInSec INT,
	environment STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/appmonitoring-datadog/'
TBLPROPERTIES ('has_encrypted_data'='false');
    
-----------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.apm_resilience_data (
    id STRING,
    appid STRING,
	assessmentName STRING,
    startTime BIGINT,
    resiliencyScore STRING,
    complianceStatus STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/appmonitoring-awsresiliencehub/'
TBLPROPERTIES ('has_encrypted_data'='false');

-----------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.catalog_info_data (
    appid STRING,
    app_name STRING,
    annotations STRING,
    lob STRING,
    is_critical STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/catalog-info/'
TBLPROPERTIES ('has_encrypted_data'='false');

---------------------------------------------------------------------------------------------------------------------
CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.itsm_incident_data  (
    id STRING,
    appid STRING,
	incidentNumber STRING,
    deploymentId STRING,
    priority STRING,
    openedDateEpoch BIGINT,
    closedDateEpoch BIGINT,
	flowsourceTime BIGINT,
	flowsourceTimeX STRING,
    toolName STRING,
    state STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/itsm_snow/'
TBLPROPERTIES ('has_encrypted_data'='false');

------------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.apm_dynatrace_data (
    id STRING,
    appid STRING,
    eventId STRING,
    eventOccurDateEpoch BIGINT,
    eventStatus STRING,
    toolName STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    recoverTimeInSec INT,
	environment STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/appmonitoring-dynatrace/'
TBLPROPERTIES ('has_encrypted_data'='false');
    
-----------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.alm_azureboards_data (
    id STRING,
    appid STRING,
    lastUpdatedEpoch BIGINT,
    projectKey STRING,
    key STRING,
    toolName STRING,
    summary STRING,
    creationDate STRING,
    priority STRING,
    commits ARRAY<STRUCT<id: STRING, timestamp: BIGINT>>,
    projectName STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    status STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/alm-azureboards/'
TBLPROPERTIES ('has_encrypted_data'='false');

------------------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.ci_githubactions_data(
	id STRING,
	appid STRING,
    runNumber STRING,
    jobsURL STRING,
    workflowName STRING,
    runStatus STRING,
    runDisplayTitle STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING,
	runStartedAt BIGINT	
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/ci-githubactions/'
TBLPROPERTIES ('has_encrypted_data'='false');

------------------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.codequality_sonarqube_data (
    id STRING,
    appid STRING,
    scanId STRING,
    highSeverity INT,
    mediumSeverity INT,
    lowSeverity INT,
    infoSeverity INT,
    scanFinishedOn STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/codequality-sonarqube/'
TBLPROPERTIES ('has_encrypted_data'='false');

---------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.apm_appdynamics_data (
    id STRING,
    appid STRING,
    eventId STRING,
    eventOccurDateEpoch BIGINT,
    eventStatus STRING,
    toolName STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    recoverTimeInSec INT,
	environment STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/appmonitoring-appdynamics/'
TBLPROPERTIES ('has_encrypted_data'='false');
    
-----------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.ci_awscodepipeline_data(
	id STRING,
	appid STRING,
    build_number STRING,
    build_url STRING,
    deployment_job STRING,
    build_status STRING,
    short_description STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING,
	build_timestamp BIGINT	
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/ci-awscodepipeline/'
TBLPROPERTIES ('has_encrypted_data'='false');

-----------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.ci_gcpcloudbuild_data(
	id STRING,
	appid STRING,
    buildnumber STRING,
    buildurl STRING,
    jobName STRING,
    result STRING,
    shortDescription STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING,
	buildtimestamp BIGINT	
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/ci-gcpcloudbuild/'
TBLPROPERTIES ('has_encrypted_data'='false');

-----------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.ci_bitbucket_data(
    id STRING,
    appid STRING,
    buildNumber STRING,
    buildUrl STRING,
    jobName STRING,
    result STRING,
    shortDescription STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING,
    buildTimestamp BIGINT	
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/ci-bitbucket/'
TBLPROPERTIES ('has_encrypted_data'='false');

----------------------------------------------------------------------------------------------------------- 

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.ci_azurepipeline_data(
    id STRING,
    appid STRING,
    buildNumber STRING,
    buildUrl STRING,
    jobName STRING,
    result STRING,
    shortDescription STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING,
    buildTimestamp BIGINT	
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/ci-azurepipeline/'
TBLPROPERTIES ('has_encrypted_data'='false');

---------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.sca_blackduck_data (
    id STRING,
    appid STRING,
    versionId STRING,
    highSeverity INT,
    criticalSeverity INT,
    mediumSeverity INT,
    lowSeverity INT,
    infoSeverity INT,
    scanFinishedOn STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/sca-blackduck/'
TBLPROPERTIES ('has_encrypted_data'='false');

---------------------------------------------------------------------------------------------------------

CREATE EXTERNAL TABLE IF NOT EXISTS `gluedb-dataengine-dev`.codequality_veracode_data (
    id STRING,
    appid STRING,
    scanId STRING,
    highSeverity INT,
    mediumSeverity INT,
    lowSeverity INT,
    infoSeverity INT,
    scanFinishedOn STRING,
    flowsourceTime BIGINT,
    flowsourceTimeX STRING,
    toolName STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
    'serialization.format' = '1',
    'ignore.malformed.json' = 'true'
)
LOCATION 's3://s3-flowsource-dataengine-demo/flowsource-agent-data/codequality-veracode/'
TBLPROPERTIES ('has_encrypted_data'='false');

-----------------------------------------------------------------------------------------------------------