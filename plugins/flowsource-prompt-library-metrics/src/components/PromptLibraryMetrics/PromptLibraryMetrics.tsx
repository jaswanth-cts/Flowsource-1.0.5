import React, { useEffect, useState, useMemo } from 'react';
import { Grid, Typography, MenuItem, Select, FormControl } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
} from '@backstage/core-components';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { configApiRef, useApi, fetchApiRef } from '@backstage/core-plugin-api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type UsageOverTime = { time: string; count: number; type?: string; tag?: string };
type TopPrompt = { prompt: string; count: number };

export const PromptLibraryMetrics = () => {
  const [userCount, setUserCount] = useState(0);
  const [promptCount, setPromptCount] = useState(0);
  const [topPrompts, setTopPrompts] = useState<TopPrompt[]>([]);
  const [usageOverTime, setUsageOverTime] = useState<UsageOverTime[]>([]);
  const config = useApi(configApiRef);
  const { fetch } = useApi(fetchApiRef);
  const apiBase = `${config.getString('backend.baseUrl')}/api/flowsource-prompt-library-metrics`;
  const [selectedType, setSelectedType] = useState('editor');
  const [selectedDays, setSelectedDays] = useState(30);
  const headings: Record<string, string> = {
    category: "Number of Categories of prompts used",
    editor: "Number of editors in which prompt library was used",
  };
  // Fetch for Usage Overview and Top 5 Prompts
  const fetchOverviewAndTopPrompts = React.useCallback(async (days: number) => {
    try {
      const response = await fetch(`${apiBase}/metrics?days=${days}`);
      if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      const data = await response.json();
      setPromptCount(data.totalPrompts || 0);
      setUserCount(data.totalUsers || 0);
      setTopPrompts(data.topPrompts || []);
    } catch (error) {
      console.error('Error fetching overview/top prompts:', error);
    }
  }, [apiBase, fetch]);

  // Fetch for Chart 
  const fetchChartData = async (type: string) => {
    try {
      const response = await fetch(`${apiBase}/metrics?days=120&type=${type}`);
      if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      const data = await response.json();
      setUsageOverTime((data.usageOverTime || []).map((item: any) => ({
        ...item,
        type: item.type || type,
      })));
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchOverviewAndTopPrompts(selectedDays);
  }, [selectedDays, fetchOverviewAndTopPrompts]);

  useEffect(() => {
    fetchChartData(selectedType);
  }, [selectedType]);

  const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedType(event.target.value as string);
  };

  const getLastMonths = (numMonths: number) => {
    const now = new Date();
    const months: { label: string; year: number; month: number }[] = [];
    for (let i = numMonths; i >= 1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months;
  };

  const lastMonths = getLastMonths(3); // e.g., Aug, Sep, Oct if current is Nov

  // Memoize filteredData and chartData for performance
  const filteredData = useMemo(
    () => usageOverTime?.filter(item => item.type === selectedType) || [],
    [usageOverTime, selectedType]
  );

  // Calculate distinct count for each month on the x-axis
  const distinctCountsByMonth = useMemo(() => {
    return lastMonths.map(({ year, month }) => {
      const itemsForMonth = filteredData.filter(item => {
        const date = new Date(item.time);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          typeof item.count === 'number' &&
          !isNaN(item.count)
        );
      });
      const distinctTags = itemsForMonth
        .map(item => item.tag)
        .filter((tag, idx, arr) => tag && arr.indexOf(tag) === idx);
      return distinctTags.length;
    });
  }, [filteredData, lastMonths]);

  const chartData = useMemo(() => ({
    labels: lastMonths.map(m => m.label),
    datasets: [
      {
        data: distinctCountsByMonth,
        backgroundColor: '#7cb943',
        barThickness: 30,
      },
    ],
  }), [filteredData, lastMonths, distinctCountsByMonth]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            return lastMonths[tooltipItems[0].dataIndex]?.label || '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (Months)',
          font: { weight: 'bold' },
        },
        grid: { display: false },
        ticks: {
          font: { weight: 'bold' },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Distinct Count',
          font: { weight: 'bold' },
        },
        grid: { display: true },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          font: { weight: 'bold' },
          callback: function(value: number | string) {
            return value;
          },
        },
      },
    },
    elements: {
      bar: {
        datalabels: { display: false },
      },
    },
  }), [lastMonths]);

  return (
    <Page themeId="tool">
      <Header title="Prompt Library Metrics" />
      <Content>
        <ContentHeader title="Prompt Library Usage" />

        {/* Top Section: Usage Overview & Top 5 Prompts */}
        <div style={{
          border: '1px solid #ccc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          background: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ marginRight: 8, fontWeight: 500 }}>Last</span>
            {[30, 60, 120].map(days => (
              <button
                key={days}
                onClick={() => setSelectedDays(days)}
                style={{
                  marginLeft: '8px',
                  fontSize: '10px',
                  minWidth: '18px',
                  height: '22px',
                  border: '1px solid #2e308e',
                  borderRadius: '4px',
                  background: selectedDays === days ? '#2e308e' : 'white',
                  color: selectedDays === days ? 'white' : '#2e308e',
                  cursor: 'pointer',
                }}
              >
                {days}
              </button>
            ))}
            <span style={{ marginLeft: 8, fontWeight: 500 }}>Days</span>
          </div>
          <Grid container spacing={3}>
            {/* Usage Overview */}
            <Grid item xs={6} md={6}>
              <div>
                <Typography gutterBottom style={{ fontSize: '16px', fontWeight: 600}}>
                  Usage Overview
                </Typography>
                <InfoCard>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '0.2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Typography style={{ fontWeight: 'bold' }}>{promptCount}</Typography>
                      <Typography>Total no of Prompts used</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Typography style={{ fontWeight: 'bold' }}>{userCount}</Typography>
                      <Typography>Total no of Users</Typography>
                    </div>
                  </div>
                </InfoCard>
              </div>
            </Grid>
            {/* Top 5 Prompts by Usage */}
            <Grid item xs={6} md={6}>
              <div>
                <Typography gutterBottom style={{ fontSize: '16px', fontWeight: 600 }}>
                  Top 5 Prompts category by Usage
                </Typography>
                <InfoCard>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>#</th>
                        <th style={{ textAlign: 'left' }}>Prompt</th>
                        <th style={{ textAlign: 'left' }}>Usage Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPrompts.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.prompt}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </InfoCard>
              </div>
            </Grid>
          </Grid>
        </div>

        {/* Divider or Section Heading */}
        <Grid item xs={6} md={6}>
        <div style={{ margin: '2rem 0 1rem 0', fontWeight: 600, fontSize: 16 }}>
          {headings[selectedType]}
        </div>

        {/* Chart Section */}
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InfoCard>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <div style={{ width: '100px' }}>
                    <FormControl
                      style={{
                        border: '1px solid #A9A9A9',
                        borderRadius: '4px',
                        padding: '2px',
                        boxShadow: 'none',
                        height: '24px',
                        minHeight: '24px',
                      }}
                    >
                      <Select
                        value={selectedType}
                        onChange={handleTypeChange}
                        defaultValue="editor"
                        style={{
                          fontSize: '12px',
                          minWidth: '80px',
                          border: 'none',
                          background: 'white',
                          boxShadow: 'none',
                          textDecoration: 'none',
                          height: '20px',
                          minHeight: '20px',
                          paddingTop: '2px',
                          paddingBottom: '2px',
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              border: '1px solid #A9A9A9',
                              fontSize: '12px',
                            },
                          },
                        }}
                        disableUnderline
                      >
                        <MenuItem value="editor" style={{ fontSize: '12px', minHeight: '24px', height: '24px' }}>Editor</MenuItem>
                        <MenuItem value="category" style={{ fontSize: '12px', minHeight: '24px', height: '24px' }}>Category</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                  <Bar
                    data={chartData}
                    options={chartOptions as any}
                    height={300}
                    width={200}
                  />
                </div>
              </InfoCard>
            </Grid>
          </Grid>
        </div>
        </Grid>
      </Content>
    </Page>
  );
};