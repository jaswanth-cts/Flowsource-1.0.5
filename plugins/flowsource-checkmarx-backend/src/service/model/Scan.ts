interface Link {
    rel: string;
    uri: string;
}
  
interface Project {
    id: number;
    name: string;
    link: Link;
}

interface Details {
    stage: string;
    step: string;
}

interface Status {
    id: number;
    name: string;
    details: Details;
}

interface DateAndTime {
    startedOn: string;
    finishedOn: string;
    engineStartedOn: string;
    engineFinishedOn: string;
}

interface ResultsStatistics {
    link: Link;
}

interface LanguageState {
    languageID: number;
    languageName: string;
    languageHash: string;
    stateCreationDate: string;
}

interface ScanState {
    path: string;
    sourceId: string;
    filesCount: number;
    linesOfCode: number;
    failedLinesOfCode: number;
    cxVersion: string;
    languageStateCollection: LanguageState[];
}

interface EngineServer {
    id: number;
    name: string;
    link: Link;
}

interface PartialScanReason {
    abortedMessage: string;
    abortedStatus: string;
}

interface Scan {
    id: number;
    project: Project;
    status: Status;
    scanType: string;
    comment: string;
    dateAndTime: DateAndTime;
    resultsStatistics: ResultsStatistics;
    scanState: ScanState;
    owner: string;
    origin: string;
    originURL: string;
    initiatorName: string;
    owningTeamId: number;
    isPublic: boolean;
    isLocked: boolean;
    isIncremental: boolean;
    scanRisk: number;
    scanRiskSeverity: number;
    engineServer: EngineServer;
    finishedScanStatus: string;
    partialScanReasons: PartialScanReason[];
    customFields: Record<string, any>;
}
  
export default Scan;
  