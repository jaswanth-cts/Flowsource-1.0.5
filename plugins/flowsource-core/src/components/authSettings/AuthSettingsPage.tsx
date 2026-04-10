import React from 'react';
import AuthSettingsTabs from './AuthSettingsTabs';
import {TAB_AUTH_PROVIDER_HEADING, TAB_EMAIL_TO_GROUP_MAPPINGS_HEADING, TAB_FLOWSOURCE_GROUP_HEADING, TAB_GROUP_MAPPING_HEADING} from "./GroupMappingConst";
import AuthGroup from './AuthGroup';
import EmailToAuthProviderGroup from './EmailToAuthProviderGroup';
import FlowsourceGroup from './FlowsourceGroup';
import AuthProvider from './AuthProvider';


const tabs = [
  {
    label: TAB_FLOWSOURCE_GROUP_HEADING,
    Component: <FlowsourceGroup/>,
    hide:true
  },
  {
    label: TAB_AUTH_PROVIDER_HEADING,
    Component: <AuthProvider/>,
    hide:true
  },
  {
    label: TAB_GROUP_MAPPING_HEADING,
    Component: <AuthGroup/>,
  },
  {
    label: TAB_EMAIL_TO_GROUP_MAPPINGS_HEADING,
    Component: <EmailToAuthProviderGroup/>,
    hide:true
  },
];

export const AuthSettingsPage = () => {
    return(<><AuthSettingsTabs tabs={tabs} /></>);
}