import React from "react";
import Chart from "chart.js/auto";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
    Chart as ChartJS,
    CategoryScale,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, Legend, ChartDataLabels);

const PieChart = ({ data }) => {
    const cssClasses = require('./BlackduckCss').default();

    const colors = {
        critical: "#8B0000",     
        high: "#ff6666",  
        medium: "#ffbf00",
        low: "#238823"
    };

    const calculateTotal = (riskProfile) => {
        return Object.values(riskProfile).reduce((acc, value) => acc + value, 0);
    };

    const createPieData = (riskProfile = {}) => {
        const entries = Object.entries(riskProfile).filter(([_, value]) => value > 0);
        
        if (entries.length === 0) {
            // Return a grey chart when no data is available
            return {
                labels: ["None"],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ["#ccc"],
                        borderWidth: 0,
                        datalabels: {
                            color: "#ffffff",
                            formatter: () => "0%",
                        },
                    },
                ],
            };
        }

        const labels = entries.map(([key]) => key);
        const values = entries.map(([_, value]) => value);
        const bgColors = labels.map(key => colors[key] || "#aaa");

        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                    datalabels: {
                        color: "#ffffff",
                        formatter: function (value, context) {
                            const total = context.dataset.data.reduce((acc, val) => acc + Number(val), 0);
                            return total > 0 ? ((value * 100) / total).toFixed(0) + "%" : "";
                        },
                    },
                },
            ],
        };
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { left: 5 },
        },
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                precision: 0,
            },
        },
    };

    const securityData = createPieData(data.securityRiskProfile);
    const licenseData = createPieData(data.licenseRiskProfile);
    const operationalData = createPieData(data.operationalRiskProfile);

    const totalSecurityRisk = calculateTotal(data.securityRiskProfile);
    const totalLicenseRisk = calculateTotal(data.licenseRiskProfile);
    const totalOperationalRisk = calculateTotal(data.operationalRiskProfile);

    const renderPie = (title, pieData, totalRisk) => {
        return (
            <div className="col-4" style={{ textAlign: "center" }}>
                <div style={{ marginBottom: -5 }}>
                    <p
                        className={cssClasses.pHeading2}
                        style={{
                            fontWeight: "bold",
                            fontSize: 14,
                            margin: 0,
                        }}
                    >
                        {title} ({totalRisk}) {/* Display the count beside the title */}
                    </p>
                </div>
                <div
                    className={cssClasses.pieChart}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop:'0.5rem'
                    }}
                >
                    <Pie data={pieData} options={options} />
                </div>
            </div>
        );
    };
    
    return (
        <>
            {/* 3 Pie Charts */}
            <div className="row" style={{ width: "90%", margin: "0 auto" }}>
                {renderPie("Security Risk", securityData, totalSecurityRisk)}
                {renderPie("License Risk", licenseData, totalLicenseRisk)}
                {renderPie("Operational Risk", operationalData, totalOperationalRisk)}
            </div>
            <div
                className="d-flex justify-content-center"
                style={{ width: "80%", marginTop: 20 }}
            >
                {["critical", "high", "medium", "low"].map((level) => (
                    <div
                        key={level}
                        className="d-flex align-items-center mx-1"
                    >
                        <div
                            style={{
                                backgroundColor: colors[level],
                                width: 12,
                                height: 12,
                                marginRight: 5,
                            }}
                        ></div>
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                textTransform: "capitalize",
                            }}
                        >
                            {level}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PieChart;
