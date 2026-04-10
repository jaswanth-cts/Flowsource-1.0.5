import React, { useState, useEffect } from 'react';

import TestMainPlanPage from './TestMainPlanPage.js';
import CreateUpdateTestPlanPage from './CreateUpdateTestPlanPage.js';

const TestPlanParentPage = (props) => {
    const [activeTab, setActiveTab] = useState('testplan');
    const [testPlanId, setTestPlanId] = useState(null);

    useEffect(async () => {
    }, []);

    return (
        <div>
            <div className={`w-100 card border-0 rounded-0`}>
                {activeTab === 'testplan' && <TestMainPlanPage setActiveTab={setActiveTab} setTestPlanId={setTestPlanId} />}
                {activeTab === 'createTestPlan' && <CreateUpdateTestPlanPage setActiveTab={setActiveTab} testPlanId={testPlanId} />}
            </div>
        </div>
    );
};

export default TestPlanParentPage;