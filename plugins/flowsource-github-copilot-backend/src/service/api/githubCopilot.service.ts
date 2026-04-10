import Editor from "../model/Editor";
import EditorLanguage from "../model/EditorLanguage";
import EditorModel from "../model/EditorModel";
import GithubCopilotResponse from "../model/GithubCopilotResponse";
import GithubHelper from "./githubHelper.service";
import { LoggerService } from '@backstage/backend-plugin-api';

class GithubCopilot {
  octokit: any;
  githubHelperService: GithubHelper;
  logger: LoggerService;

  constructor( logger: LoggerService) {
    this.githubHelperService = new GithubHelper( logger);
    this.logger = logger;
  }

  // fetch the copilot usage details for a organization using the token. The response from the api which will
  // be returned for each day has to be accumulated across all days for langauge, editor. The chat and user metrics 
  // are used as-is for each day.
  async getGithubCopilotUsageDetails(organization:string, githubToken:any) {
    const langMetrics = new Map();
    const editorMetrics = new Map();
    const chatMetrics = new Map();
    const userMetrics = new Map();
    try {
      this.octokit = await this.githubHelperService.getGithubTokenConfig(githubToken);
      const response = await this.octokit.request('GET /orgs/{org}/copilot/metrics', {
        org: organization
      });
      const usageResp: GithubCopilotResponse[] = response.data;
      // The response is structured daywise, the metrics needs to be accumulated for all the days.
      usageResp.forEach((copilotResp: GithubCopilotResponse) => {
        let chatsAccepted = 0;
        if (copilotResp.copilot_ide_chat.editors) {
          copilotResp.copilot_ide_chat.editors.forEach((editor: Editor) => {
            editor.models.forEach((editorModel: EditorModel) => {
              chatsAccepted += editorModel.total_chat_insertion_events + editorModel.total_chat_copy_events;
            });
          });
        } 
        chatMetrics.set(copilotResp.date, chatsAccepted);
        
        const userMetricsMap = new Map();
        userMetricsMap.set('total_active_users', copilotResp.total_active_users);
        userMetricsMap.set('total_active_chat_users', copilotResp.copilot_ide_chat.total_engaged_users);
        
        userMetrics.set(copilotResp.date, userMetricsMap);
        if (copilotResp.copilot_ide_code_completions.editors) {
          copilotResp.copilot_ide_code_completions.editors.forEach((editor: Editor) => {
            let suggestions_count = 0;
            let acceptances_count = 0;
            let lines_suggested = 0;
            let lines_accepted = 0;
            editor.models.forEach((editorModel: EditorModel) => {
              editorModel.languages.forEach((editorLanguage: EditorLanguage) => {
                if (!langMetrics.get(editorLanguage.name)) {
                  // Creating a new Map for each language
                  const langMetricsMap = new Map();
                  langMetricsMap.set('suggestions_count', editorLanguage.total_code_suggestions);
                  langMetricsMap.set('acceptances_count', editorLanguage.total_code_acceptances);
                  langMetricsMap.set('lines_suggested', editorLanguage.total_code_lines_suggested);
                  langMetricsMap.set('lines_accepted', editorLanguage.total_code_lines_accepted);
                  langMetrics.set(editorLanguage.name, langMetricsMap);
                } else {
                  const langMetricsMap = langMetrics.get(editorLanguage.name);
                  // Adding the metrics data for the language for all days, as the data is specified for each day.
                  langMetricsMap.set('suggestions_count', langMetricsMap.get('suggestions_count') + editorLanguage.total_code_suggestions);
                  langMetricsMap.set('acceptances_count', langMetricsMap.get('acceptances_count') + editorLanguage.total_code_acceptances);
                  langMetricsMap.set('lines_suggested', langMetricsMap.get('lines_suggested') + editorLanguage.total_code_lines_suggested);
                  langMetricsMap.set('lines_accepted', langMetricsMap.get('lines_accepted') + editorLanguage.total_code_lines_accepted);
                  langMetrics.set(editorLanguage.name, langMetricsMap);
                }
                suggestions_count += editorLanguage.total_code_suggestions;
                acceptances_count += editorLanguage.total_code_acceptances;
                lines_suggested += editorLanguage.total_code_lines_suggested;
                lines_accepted += editorLanguage.total_code_lines_accepted;
  
              });
            });
            if (!editorMetrics.get(editor.name)) {
              // Creating a new Map for each editor
              const editorMetricsMap = new Map();
                editorMetricsMap.set('suggestions_count', suggestions_count);
                editorMetricsMap.set('acceptances_count', acceptances_count);
                editorMetricsMap.set('lines_suggested', lines_suggested);
                editorMetricsMap.set('lines_accepted', lines_accepted);
                editorMetrics.set(editor.name, editorMetricsMap);
            } else {
              const editorMetricsMap = editorMetrics.get(editor.name);
              // Adding the metrics data for the editor for all days, as the data is specified for each day.
              editorMetricsMap.set('suggestions_count', editorMetricsMap.get('suggestions_count') + suggestions_count);
              editorMetricsMap.set('acceptances_count', editorMetricsMap.get('acceptances_count') + acceptances_count);
              editorMetricsMap.set('lines_suggested', editorMetricsMap.get('lines_suggested') + lines_suggested);
              editorMetricsMap.set('lines_accepted', editorMetricsMap.get('lines_accepted') + lines_accepted);
              editorMetrics.set(editor.name, editorMetricsMap);
            }
          });
        }
      });
        
    } catch (error) {
      this.logger.error('Error fetching pull requests:', error as Error);
    }
    // Converting the map data for each metrics to list of objects
    const langMetricsData = await this.populateLangMetrics(langMetrics);
    const editorMetricsData = await this.populateEditorMetrics(editorMetrics);
    const chatMetricsData = await this.populateChatMetrics(chatMetrics);
    const userMetricsData = await this.populateUserMetrics(userMetrics);

    return {
      'langMetrics': langMetricsData,
      'editorMetrics': editorMetricsData,
      'chatMetrics': chatMetricsData,
      'userMetrics': userMetricsData
    };
  }
  async populateLangMetrics(langMetricsMap: Map<string, Map<string, number>>) {
    const langMetrics: any[] = [];
    // Flatenning the language metrics map to list of objects 
    langMetricsMap.forEach((value, key) => {
      langMetrics.push({
        language: key,
        suggestionsCount: value.get('suggestions_count'),
        acceptancesCount: value.get('acceptances_count'),
        linesSuggested: value.get('lines_suggested'),
        linesAccepted: value.get('lines_accepted')
      });
    });
    return langMetrics;
  }

  async populateEditorMetrics(editorMetricsMap: Map<string, Map<string, number>>) {
    const editorMetrics: any[] = [];
    // Flatenning the editor metrics map to list of objects 
    editorMetricsMap.forEach((value, key) => {
      editorMetrics.push({
        editor: key,
        suggestionsCount: value.get('suggestions_count'),
        acceptancesCount: value.get('acceptances_count'),
        linesSuggested: value.get('lines_suggested'),
        linesAccepted: value.get('lines_accepted')
      });
    });
    return editorMetrics;
  }

  async populateChatMetrics(chatMetricsMap: Map<string, number>) {
    const chatMetrics: any[] = [];
    // Flatenning the chat metrics map to list of objects 
    chatMetricsMap.forEach((value, key) => {
      chatMetrics.push({
        trendDate: key,
        chatsAccepted: value
      });
    });
    return chatMetrics;
  }

  async populateUserMetrics(userMetricsMap: Map<string, Map<string, number>>) {
    const userMetrics: any[] = [];
    // Flatenning the user metrics map to list of objects 
    userMetricsMap.forEach((value, key) => {
      userMetrics.push({
        trendDate: key,
        totalActiveUsers: value.get('total_active_users'),
        totalActiveChatUsers: value.get('total_active_chat_users')
      });
    });
    return userMetrics;
  }
}

export default GithubCopilot;