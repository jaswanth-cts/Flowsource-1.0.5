import React from 'react';
import cssClasses from './PrismaCloudCss';
import PieChart from './PieChart';
import { Link } from 'react-router-dom';

import PluginVersion from '../PluginVersion/PluginVersion';

const DisplayError = props => {
  return <div>{props.err} </div>;
};

const HostScanDetail = props => {
  const { hostdata, hosturl } = props;

    let vulnerabilityDistribution = {}
    vulnerabilityDistribution.results = {
        critical : hostdata?.vulnerabilityDistribution?.critical,
        high : hostdata?.vulnerabilityDistribution?.high,
        medium : hostdata?.vulnerabilityDistribution?.medium,
        low : hostdata?.vulnerabilityDistribution?.low,
    } ;
    let complianceDistribution = {}
    complianceDistribution.results = {
        critical : hostdata?.complianceDistribution?.critical,
        high : hostdata?.complianceDistribution?.high,
        medium : hostdata?.complianceDistribution?.medium,
        low : hostdata?.complianceDistribution?.low,
    } ;

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
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}> {"Type"} </td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.type}</td>
                                </tr>
                                                      
                                <tr>
                                  <td className={`${classes.cellLeftwithLeftPaddingStyle}`}>{"Scan Time"}</td>
                                  <td className={`${classes.cellLeftStyle}`}>{hostdata.scanTime}</td>
                                </tr>

                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'OS'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.osDistro}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'OS Release'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.osDistroRelease}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'OS Distribution'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.distro}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Vulnerabilities Count'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.vulnerabilitiesCount}
                            </td>
                          </tr>

                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Compliance Issues Count'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata.complianceIssuesCount}
                            </td>
                          </tr>

                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Vulnerabilities RiskScor'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata?.vulnerabilityRiskScore}
                            </td>
                          </tr>

                          <tr>
                            <td
                              className={`${classes.cellLeftwithLeftPaddingStyle}`}
                            >
                              {'Compliance RiskScor'}
                            </td>
                            <td className={`${classes.cellLeftStyle}`}>
                              {hostdata?.complianceRiskScore}
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

export default HostScanDetail;
