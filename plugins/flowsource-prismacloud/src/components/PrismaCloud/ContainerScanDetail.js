import React from 'react';
import cssClasses from './PrismaCloudCss';
import PieChart from './PieChart';
import { Link } from 'react-router-dom';

import PluginVersion from '../PluginVersion/PluginVersion';

const DisplayError = props => {
  return <div>{props.err} </div>;
};

const ContainerScanDetail = props => {
  const { hostdata, hosturl } = props;

  let vulnerabilityDistribution = {};
  if (
    hostdata?.info?.vulnerabilityDistribution?.critical > 0 ||
    hostdata?.info?.vulnerabilityDistribution?.high > 0 ||
    hostdata?.info?.vulnerabilityDistribution?.medium > 0 ||
    hostdata?.info?.vulnerabilityDistribution?.low > 0
  ) {
    vulnerabilityDistribution.results = {
      critical: hostdata?.info?.vulnerabilityDistribution?.critical,
      high: hostdata?.info?.vulnerabilityDistribution?.high,
      medium: hostdata?.info?.vulnerabilityDistribution?.medium,
      low: hostdata?.info?.vulnerabilityDistribution?.low,
    };
  } else {
    vulnerabilityDistribution.results = {
      noError: 1,
    };
  }
  let complianceDistribution = {};
  complianceDistribution.results = {
    critical: hostdata?.info.complianceDistribution?.critical,
    high: hostdata?.info.complianceDistribution?.high,
    medium: hostdata?.info.complianceDistribution?.medium,
    low: hostdata?.info.complianceDistribution?.low,
  };

    const classes = cssClasses();


    return (
      <div className={`row`}>
        <div className={`col-12`}>
          <div className={`card`}>
             <div className={'card-body'}>
                <div className={`${classes.backgroundClass}`}>
                  <div className={`row`}>
                    <div className={`col-12 text-end`}>
                      <PluginVersion />
                    </div>
                  </div>
                  <div className={`row`}>
                      <div className={`col-6`}>
                        <div className={`card ms-4`}>
                          <div className={`card-body ${classes.cardStyle}`}>
                            <h6 className={`card-title mt-0 mb-2`}>
                              <span className={`${classes.pnTitle} me-2`}><b className={`ms-4 mt-2`}>Summary of host <Link to={hosturl + "/home/runtime?computeState=%252Fradars%252Fhosts"} target="_blank">{hostdata.hostname}</Link> </b></span>
                            </h6>
                            <table className={`table ms-4 ${classes.tableStriped1} table-bordered`}>
                            <tbody>
                            <tr>
                              <td colspan="2" className={`${classes.cellLeftAlignWithHighLight}`} >Instance Summary</td>
                              </tr>
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}> {"Name"} </td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.info.name}</td>
                                </tr>
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}> {"App"} </td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.info.app}</td>
                                </tr>
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}> {"Namespace"} </td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.info.namespace}</td>
                                </tr>
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}> {"Cluster"} </td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.info.cluster}</td>
                                </tr>
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}> {"ClusterType"} </td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.info.clusterType}</td>
                                </tr>
                                
                                                      
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}>{"Scan Time"}</td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.scanTime}</td>
                                </tr>

                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Resource ID'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.info.cloudMetadata.resourceID}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Cloud Provider'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.info.cloudMetadata.provider}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Resource Type '}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.info.cloudMetadata.type}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className={`card-body ${classes.cardStyle}`}>
                      <table
                        className={`table ms-4 ${classes.tableStriped1} table-bordered`}
                      >
                        <tbody>
                          <tr>
                            <td
                              colspan="2"
                              className={`${classes.cellLeftAlignWithHighLight}`}
                            >
                              Firewall Protection
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Enabled'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata?.firewallProtection?.enabled
                                ? 'true'
                                : 'false'}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Supported'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata?.firewallProtection?.supported
                                ? 'true'
                                : 'false'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {hostdata?.firewallProtection?.unprotectedProcesses ? (
                      <div className={`card-body ${classes.cardStyle}`}>
                        <table
                          className={`table ms-4 ${classes.tableStriped1} table-bordered`}
                        >
                          <tbody>
                            <tr>
                              <td
                                colspan="3"
                                className={`${classes.cellLeftAlignWithHighLight}`}
                              >
                                Firewall Unprotected Processes(Runtime
                                information)
                              </td>
                            </tr>
                            <tr>
                              <td>{'Process'}</td>
                              <td>{'Port'}</td>
                              <td>{'TLS'}</td>
                            </tr>
                            {hostdata?.firewallProtection?.unprotectedProcesses?.map(
                              item => (
                                <>
                                  <tr>
                                    <td>{item.process}</td>
                                    <td>{item.port}</td>
                                    <td>{item.tls ? 'true' : 'false'}</td>
                                  </tr>
                                </>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                <div className={`col-6`}>
                  <div className={`row`}>
                    <div className={`col`}>
                      <div className={`card ${classes.card2}`}>
                        <h6 className={`card-title mt-3 mb-2`}>
                          <span className={`${classes.pnTitle} me-2`}>
                            <b className={`ms-4`}>Vulnerability Distribution</b>
                          </span>
                        </h6>
                        <PieChart value={vulnerabilityDistribution} />
                      </div>
                    </div>
                  </div>
                  <div className={`row`}>
                    <div className={`col`}>
                      <div className={`card ${classes.card2}`}>
                        <h6 className={`card-title mt-3 mb-2`}>
                          <span className={`${classes.pnTitle} me-2`}>
                            <b className={`ms-4`}>Compliance Distribution</b>
                          </span>
                        </h6>
                        <PieChart value={complianceDistribution} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerScanDetail;
