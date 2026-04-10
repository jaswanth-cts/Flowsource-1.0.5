import log from 'loglevel';
export const Endpoint = Object.freeze({
    DEPLOYMENT_FREQUENCY: '/deploymentFrequency',
    LEAD_TIME_FOR_CHANGES: '/leadTimeForChanges',
    MEAN_TIME_TO_RECOVER: '/meanTimeToRecover',
    CHANGE_FAILURE_RATE: '/changeFailureRate',
    DEPLOYMENT_TREND: '/deploymentTrend',
    LEAD_TIME_TREND: '/leadTimeTrend',
    MEAN_TIME_TREND: '/meanTimeTrend',
    CHANGE_FAILURE_TREND: '/changeFailureTrend',
});

function getDoraMetricsBackendUrl(backendUrl) {
    return (backendUrl.endsWith('/') ? backendUrl : backendUrl + '/') + 'api/flowsource-dora-metrics';
}

function getEndpointUrl(backendUrl, apiPath, appid) {
    const baseApiUrl = getDoraMetricsBackendUrl(backendUrl);
    const queryParam = '?appid=' + appid;
    return baseApiUrl + apiPath + queryParam;
}

async function fetchAndUpdateMetric(fetch, url, setMetricValue, setLastUpdateTime, setError) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            setMetricValue(result.metricValue);
            setLastUpdateTime(result.lastUpdateTime);
            log.debug('Metric -> ', result.metricValue);
        } else {
            log.error('Error fetching data:', response);
            if (response.status === 503) {
                setError('This plugin has not been configured with the required values. Please ask your administrator to configure it');
            }
        }
    } catch (error) {
        log.error('Error:', error);
    }
}
async function fetchAndUpdateTrend(fetch, url, setLabels, setChartData) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const trend = await response.json();
            const labels = [];
            const values = [];
            for (const index in trend) {
                labels.push(trend[index].label);
                values.push(trend[index].count);
            }
            setLabels(labels);
            setChartData(values);
            log.info('Trend -> ', labels, values);
        } else {
            log.error('Error fetching data:', response.statusText);
        }
    } catch (error) {
        log.error('Error:', error);
    }
}
export function fetchAndUpdateDeploymentFrequency(fetch, backendUrl, setDeploymentFrequencyValue, setDeploymentFrequencyValueLastUpdateTime, setError, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.DEPLOYMENT_FREQUENCY, appid);
    fetchAndUpdateMetric(fetch, url, setDeploymentFrequencyValue, setDeploymentFrequencyValueLastUpdateTime, setError);
}

export function fetchAndUpdateLeadTimeForChanges(fetch, backendUrl, setLeadTimeForChangesValue, setLeadTimeForChangesValueLastUpdateTime, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.LEAD_TIME_FOR_CHANGES, appid);
    fetchAndUpdateMetric(fetch, url, setLeadTimeForChangesValue, setLeadTimeForChangesValueLastUpdateTime);
}

export function fetchAndUpdateMeanTimeToRecover(fetch, backendUrl, setMeanTimeToRecoverValue, setMeanTimeToRecoverValueLastUpdateTime, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.MEAN_TIME_TO_RECOVER, appid);
    fetchAndUpdateMetric(fetch, url, setMeanTimeToRecoverValue, setMeanTimeToRecoverValueLastUpdateTime);
}

export function fetchAndUpdateChangeFailureRate(fetch, backendUrl, setChangeFailureRateValue, setChangeFailureRateValueLastUpdateTime, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.CHANGE_FAILURE_RATE, appid);
    fetchAndUpdateMetric(fetch, url, setChangeFailureRateValue, setChangeFailureRateValueLastUpdateTime);
}

export async function fetchAndUpdateDeploymentTrend(fetch, backendUrl, setLabels, setChartData, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.DEPLOYMENT_TREND, appid);
    fetchAndUpdateTrend(fetch, url, setLabels, setChartData);
}

export async function fetchAndUpdateLeadTimeTrend(fetch, backendUrl, setLabels, setChartData, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.LEAD_TIME_TREND, appid);
    fetchAndUpdateTrend(fetch, url, setLabels, setChartData);
}

export async function fetchAndUpdateMeanTimeTrend(fetch, backendUrl, setLabels, setChartData, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.MEAN_TIME_TREND, appid);
    fetchAndUpdateTrend(fetch, url, setLabels, setChartData);
}

export async function fetchAndUpdateChangeFailureTrend(fetch, backendUrl, setLabels, setChartData, appid) {
    const url = getEndpointUrl(backendUrl, Endpoint.CHANGE_FAILURE_TREND, appid);
    fetchAndUpdateTrend(fetch, url, setLabels, setChartData);
}
