import EditorLanguage from "./EditorLanguage";

interface EditorModel {
    name: string;
    total_chat_insertion_events: number;
    total_chat_copy_events: number;
    languages: EditorLanguage[];
}

export default EditorModel;