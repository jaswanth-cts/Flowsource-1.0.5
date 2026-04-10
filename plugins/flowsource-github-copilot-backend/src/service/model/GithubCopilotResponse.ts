import CopilotIdeChat from "./CopilotIdeChat";
import CopilotIdeCode from "./CopilotIdeCode";

interface GithubCopilotResponse {
    date: string;
    total_active_users: number;
    copilot_ide_chat: CopilotIdeChat;
    copilot_ide_code_completions: CopilotIdeCode
}

export default GithubCopilotResponse;