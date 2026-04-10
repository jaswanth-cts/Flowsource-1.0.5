import React, { useState } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import cssClasses from './SecurityComponentMainCss';
import { EntitySwitch } from '@backstage/plugin-catalog';
import { EmptyState } from '@backstage/core-components';
import PluginLoaderFactory from './PluginLoaderFactory';
import 'bootstrap/dist/css/bootstrap.min.css';
const SecurityComponentMain = () => {
    const entity = useEntity();
    const annotations = entity.entity.metadata.annotations;
    const classes = cssClasses();
    const [expanded, setExpanded] = useState(false);
    const config = useApi(configApiRef);
    const pluginNames = config.getString('wellArchitectedPlugins.plugins')
        .split(',')
        .map(name => name.trim()) || [];
    const plugins = [
        { name: 'SAST', shouldRender: !!annotations && 'flowsource/checkmarx-project-id' in annotations && annotations['flowsource/checkmarx-project-id'].trim().length > 0 },
        { name: 'Veracode Scan', shouldRender: !!annotations && 'flowsource/veracode-app-name' in annotations },
        { name: 'Blackduck Scan', shouldRender: !!annotations && 'flowsource/blackduck-project-id' in annotations },
        { name: 'SCA', shouldRender: !!annotations && 'flowsource/prismacloud-scan-repo' in annotations && 'flowsource/prismacloud-scan-branch' in annotations, props: { scantype: 'SCA' } },
        { name: 'Infra Code Scan', shouldRender: !!annotations && 'flowsource/prismacloud-iac-scan-repo' in annotations && 'flowsource/prismacloud-iac-scan-branch' in annotations, props: { scantype: 'IaC' } },
        { name: 'Prisma Image Scan', shouldRender: !!annotations && 'flowsource/prismacloud-container-images' in annotations },
        { name: 'Prisma Defender Host Scan', shouldRender: !!annotations && 'flowsource/prismacloud-defender-hosts' in annotations },
        { name: 'Prisma Defender Container Scan', shouldRender: !!annotations && 'flowsource/prismacloud-defender-cluster-name' in annotations && 'flowsource/prismacloud-defender-container-namespaces' in annotations && 'flowsource/prismacloud-defender-container-deployment-images' in annotations },
    ];

    // Filter plugins based on entity.spec.type === 'infrastructure'
    const filteredPlugins = entity.entity.spec.type === 'infrastructure'
     ? plugins.filter(plugin =>
         ['Infra Code Scan', 'Prisma Image Scan', 'Prisma Defender Container Scan'].includes(plugin.name),
     )
     : plugins;

    const availablePlugins = filteredPlugins.filter(plugin => pluginNames.includes(plugin.name));
    const handleExpand = (panel) => (_e, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div>
            {availablePlugins.map(plugin => (
                <Accordion key={plugin.name} expanded={expanded === plugin.name} onChange={handleExpand(plugin.name)}>
                    <AccordionSummary className={`bg-info`} expandIcon={<ExpandMoreIcon />} aria-controls={`${plugin.name}-content`} id={`${plugin.name}-header`}>
                        <Typography>{plugin.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={`${classes.accordingDetailsStyle}`}>
                        <Typography>
                            <Grid container>
                                <Grid item md={12}>
                                    {plugin.shouldRender ? (
                                        expanded === plugin.name && <PluginLoaderFactory pluginName={plugin.name} {...plugin.props} />
                                    ) : (
                                        <div className='mt-2 ms-1 me-1 mb-2'>
                                            <EntitySwitch>
                                                <EntitySwitch.Case>
                                                    <EmptyState
                                                        title={`No ${plugin.name} page is available for this entity`}
                                                        missing="info"
                                                        description={`You need to add an annotation to your component if you want to see the ${plugin.name} page for it.`}
                                                    />
                                                </EntitySwitch.Case>
                                            </EntitySwitch>
                                        </div>
                                    )}
                                </Grid>
                            </Grid>
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default SecurityComponentMain;