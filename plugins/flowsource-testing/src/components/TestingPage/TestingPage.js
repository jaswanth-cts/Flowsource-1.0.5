import React, { useEffect, useState } from 'react';
import AccordionItem from './AccordionItem';
import { FlowsourceZephyrPage } from '@flowsource/plugin-flowsource-zephyr';
import { FlowsourcePlaywrightPage } from '@flowsource/plugin-flowsource-playwright';
import { FlowsourceSeleniumPage } from '@flowsource/plugin-flowsource-selenium';


const TestingPage = ({ componentType }) => {

  const [accordions, setAccordions] = useState([]);
  
  useEffect(() => {
    if(componentType.flowsourceComponentType === "websiteEntityPage" || 
      componentType.flowsourceComponentType === "environmentEntityPage") {
      setAccordions(
        [
          // { title: 'Zephyr', ComponentToRender: FlowsourceZephyrPage },
          { title: 'Playwright', ComponentToRender: FlowsourcePlaywrightPage },
          { title: 'Selenium', ComponentToRender: FlowsourceSeleniumPage },
        ]
      );
    } else if(componentType.flowsourceComponentType === "serviceEntityPage") {
      setAccordions(
        [
          // { title: 'Zephyr', ComponentToRender: FlowsourceZephyrPage },
        ]
      );
    }
  }, [])

  return (
    <>
      {accordions.map(({ title, ComponentToRender }) => (
        <AccordionItem
          key={title}
          title={title}
          ComponentToRender={ComponentToRender} // Pass the component to render
          isAccordionInitiallyExpanded={accordions.length === 1} // Expand the accordion if there is only one
        />
      ))}
    </>
  );
};

export default TestingPage;
