import React, { useState, useEffect } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import log from 'loglevel';

const FailureTrendAnalysis = () => {
    const { fetch } = useApi(fetchApiRef);
    const config = useApi(configApiRef);
    const { entity } = useEntity();
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/flowsource-cctp/';

    // State hooks to store data for BarChart and LineChart
    const [topFailTestcasesData, setTopFailTestcasesData] = useState({});
    const [topExceptionsData, setTopExceptionsData] = useState({});
    const [trendByDateData, setTrendByDateData] = useState({});
    const [trendByExecutionData, setTrendByExecutionData] = useState({});
    const [isLoadingTopFailTestcases, setIsLoadingTopFailTestcases] = useState(true);
    const [isLoadingTopExceptions, setIsLoadingTopExceptions] = useState(true);
    const [isLoadingTrendByDate, setIsLoadingTrendByDate] = useState(true);
    const [isLoadingTrendByExecution, setIsLoadingTrendByExecution] = useState(true);

    // State hooks for dropdown values
    const [daysFailedTest, setDaysFailedTest] = useState('All');
    const [daysExceptions, setDaysExceptions] = useState('All');
    const [daysTrendByDate, setDaysTrendByDate] = useState('All');
    const [daysTrendByExecution, setDaysTrendByExecution] = useState('All');
    const projectName = entity.metadata.annotations['flowsource/CCTP-project-name'];

    // API URLs for BarChart and LineChart data
    const getApiUrl = (baseUrl, days) => `${baseUrl}&days=${days === 'All' ? '' : days}`;

    const fetchTopFailTestcasesData = async (days) => {
        setIsLoadingTopFailTestcases(true);
        try {
            const url = getApiUrl(`${backendBaseApiUrl}cctp-proxy/flowsource/failure-trend/top-fail-testcases?projectName=${projectName}`, days);
            const response = await fetch(url);
            const data = await response.json();
            setTopFailTestcasesData(data);
        } catch (error) {
            log.error("Error fetching Top Fail Testcases data", error);
        } finally {
            setIsLoadingTopFailTestcases(false);
        }
    };

    const fetchTopExceptionsData = async (days) => {
        setIsLoadingTopExceptions(true);
        try {
            const url = getApiUrl(`${backendBaseApiUrl}cctp-proxy/flowsource/failure-trend/top-exceptions?projectName=${projectName}`, days);
            const response = await fetch(url);
            const data = await response.json();
            setTopExceptionsData(data);
        } catch (error) {
            log.error("Error fetching Top Exceptions data", error);
        } finally {
            setIsLoadingTopExceptions(false);
        }
    };

    const fetchTrendByDateData = async (days) => {
        setIsLoadingTrendByDate(true);
        try {
            const url = getApiUrl(`${backendBaseApiUrl}cctp-proxy/flowsource/failure-trend/trendAnalysis?projectName=${projectName}&filter=dateWise`, days);
            const response = await fetch(url);
            const data = await response.json();
            setTrendByDateData(data);
        } catch (error) {
            log.error("Error fetching Trend By Date data", error);
        } finally {
            setIsLoadingTrendByDate(false);
        }
    };

    const fetchTrendByExecutionData = async (days) => {
        setIsLoadingTrendByExecution(true);
        try {
            const url = getApiUrl(`${backendBaseApiUrl}cctp-proxy/flowsource/failure-trend/trendAnalysis?projectName=${projectName}&filter=executionWise`, days);
            const response = await fetch(url);
            const data = await response.json();
            setTrendByExecutionData(data);
        } catch (error) {
            log.error("Error fetching Trend By Execution data", error);
        } finally {
            setIsLoadingTrendByExecution(false);
        }
    };

    useEffect(() => {
        fetchTopFailTestcasesData(daysFailedTest);
    }, [daysFailedTest]);

    useEffect(() => {
        fetchTopExceptionsData(daysExceptions);
    }, [daysExceptions]);

    useEffect(() => {
        fetchTrendByDateData(daysTrendByDate);
    }, [daysTrendByDate]);

    useEffect(() => {
        fetchTrendByExecutionData(daysTrendByExecution);
    }, [daysTrendByExecution]);

    // Dropdown options
    const dropdownOptions = [
        { value: 'All', label: 'All' },
        { value: '7', label: '7 days' },
        { value: '15', label: '15 days' },
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
        { value: '90', label: '90 days' },
    ];

    // Handle dropdown changes
    const handleDropdownChangeFailedTest = (event) => {
        setDaysFailedTest(event.target.value);
    };

    const handleDropdownChangeExceptions = (event) => {
        setDaysExceptions(event.target.value);
    };

    const handleDropdownChangeTrendByDate = (event) => {
        setDaysTrendByDate(event.target.value);
    };

    const handleDropdownChangeTrendByExecution = (event) => {
        setDaysTrendByExecution(event.target.value);
    };

    return (
        <div>
            <div className={`row`}>
                {/* Pass the fetched data to a single BarChart component for both charts */}
                <BarChart
                    values={{ topFailTestcasesData, topExceptionsData }}
                    dropdownOptionsFailedTest={dropdownOptions}
                    dropdownOptionsExceptions={dropdownOptions}
                    handleDropdownChangeFailedTest={handleDropdownChangeFailedTest}
                    handleDropdownChangeExceptions={handleDropdownChangeExceptions}
                    isLoadingTopFailTestcases={isLoadingTopFailTestcases}
                    isLoadingTopExceptions={isLoadingTopExceptions}
                />
            </div>
            <div className={`row`}>
                {/* Pass the fetched data to a single LineChart component for both charts */}
                <LineChart
                    values={{ trendByDateData, trendByExecutionData }}
                    dropdownOptionsTrendByDate={dropdownOptions}
                    dropdownOptionsTrendByExecution={dropdownOptions}
                    handleDropdownChangeTrendByDate={handleDropdownChangeTrendByDate}
                    handleDropdownChangeTrendByExecution={handleDropdownChangeTrendByExecution}
                    isLoadingTrendByDate={isLoadingTrendByDate}
                    isLoadingTrendByExecution={isLoadingTrendByExecution}
                />
            </div>
        </div>
    );
};

export default FailureTrendAnalysis;
