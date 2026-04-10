import { FederationRuntimePlugin } from '@module-federation/runtime/types';

//import React, { Component, ReactNode, ErrorInfo } from "react";


export default function (): FederationRuntimePlugin {
  const getModule = (pg: () => any, from: string): (() => any) | { default: () => any } => {
    if (from === 'build') {
      return () => ({
        __esModule: true,
        default: pg,
      });
    } else {
      return {
        default: pg,
      };
    }
  };

  return {
    name: 'remote-error-handling-plugin',
    errorLoadRemote({ id, error, from, origin }) {
      console.error(id, 'ERROR !! There is some error when calling remote', error);
      const pg = function () {
        console.error(id, 'There is some error when calling remote', error);
        throw error;
      };

      return getModule(pg, from);
    },
  };
}