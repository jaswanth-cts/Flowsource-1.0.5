# client.py
import requests
from typing import Optional, Dict, Any, List
from config import JiraConfig
from exceptions import JiraValidationError
import json

class JiraClient:
    def __init__(self, config: Optional[JiraConfig] = None):
        self.config = config or JiraConfig()
        self.session = requests.Session()
        self.session.auth = (self.config.email, self.config.token)
        self.session.headers.update({"Content-Type": "application/json"})
        self._epic_name_field = None
        self._epic_link_field = None

    def _request(self, method: str, path: str, **kwargs):
        url = f"{self.config.base_url}{path}"
        resp = self.session.request(method, url, **kwargs)
        if not resp.ok:
            raise RuntimeError(f"Jira API error {resp.status_code}: {resp.text}")
        return resp

    def _load_custom_fields(self):
        if self._epic_name_field and self._epic_link_field:
            return
        fields = self._request("GET", "/rest/api/3/field").json()
        for f in fields:
            if f["name"] == "Epic Name":
                self._epic_name_field = f["id"]
            elif f["name"] == "Epic Link":
                self._epic_link_field = f["id"]

    def get_issue_types(self) -> str:
        meta = self._request("GET", f"/rest/api/3/issue/createmeta?projectKeys={self.config.project_key}").json()
        payload = {t["name"].lower(): t["name"] for t in meta["projects"][0]["issuetypes"]}
        return json.dumps(payload)

    def get_priorities(self) -> List[str]:
        return [p["name"] for p in self._request("GET", "/rest/api/3/priority").json()]

    def create_issue(self, summary: str, description: str, priority: Optional[str],
                     issue_type: str, epic_name: Optional[str]) -> str:
        self._load_custom_fields()
        issue_types = self.get_issue_types()
        priorities = self.get_priorities()

        issue_type_clean = issue_type.strip().lower()
        if issue_type_clean not in issue_types:
            raise JiraValidationError(f"Invalid issue type: {issue_type}")

        fields = {
            "project": {"key": self.config.project_key},
            "issuetype": {"name": issue_types[issue_type_clean]},
            "summary": summary,
            "description": self._as_rich_text(description),
        }

        if priority:
            priority=priority.capitalize()
            if priority not in priorities:
                raise JiraValidationError(f"Invalid priority: {priority}")
            fields["priority"] = {"name": priority}
        else:
            priority="Low"
            fields["priority"] = {"name": priority}

        if issue_type_clean == "epic" and epic_name:
            fields[self._epic_name_field] = epic_name

        data = self._request("POST", "/rest/api/3/issue", json={"fields": fields}).json()
        payload = {
            "message": "Issue created successfully",
            "key": data["key"],
            "url": f"{self.config.base_url}/browse/{data['key']}",
            "summary": summary,
            "type": issue_types[issue_type_clean],
        }
        return json.dumps(payload)  # <-- returns a str

    def update_issue(self, key: str, summary: Optional[str], description: Optional[str], priority: Optional[str]) -> str:
        fields = {}
        if summary:
            fields["summary"] = summary
        if description:
            fields["description"] = self._as_rich_text(description)
        if priority:
            priority=priority.capitalize()
            if priority not in self.get_priorities():
                raise JiraValidationError(f"Invalid priority: {priority}")
            fields["priority"] = {"name": priority}

        if not fields:
            raise JiraValidationError("Nothing to update.")

        self._request("PUT", f"/rest/api/3/issue/{key}", json={"fields": fields})
        payload = {
            "message": f"Issue {key} updated successfully",
            "key": key,
            "updated_fields": list(fields.keys())
        }
        return json.dumps(payload)

    def link_issue_to_epic(self, issue_key: str, epic_key: str) -> str:
        self._load_custom_fields()
        self._request("PUT", f"/rest/api/3/issue/{issue_key}", json={
            "fields": {self._epic_link_field: epic_key}
        })
        payload = {
            "message": f"Issue {issue_key} linked to epic {epic_key}",
            "issue": issue_key,
            "epic": epic_key
        }
        return json.dumps(payload)

    def add_comment(self, key: str, comment: str) -> str:
        body = {
            "body": {
                "type": "doc", "version": 1,
                "content": [{"type": "paragraph", "content": [{"type": "text", "text": comment}]}]
            }
        }
        self._request("POST", f"/rest/api/3/issue/{key}/comment", json=body)
        payload = {
            "message": f"Comment added to issue {key}",
            "issue": key,
            "comment": comment
        }
        return json.dumps(payload)

    def get_issue(self, key: str) -> str:
        data = self._request("GET", f"/rest/api/3/issue/{key}").json()
        fields = data["fields"]
        payload = {
            "key": key,
            "summary": fields["summary"],
            "status": fields["status"]["name"],
            "priority": fields["priority"]["name"],
            "description": self._readable_desc(fields)
        }
        return json.dumps(payload)

    def search_issues(self, jql: str, max_results: int = 10) -> str:
        issues = self._request("GET", "/rest/api/3/search", params={"jql": jql, "maxResults": max_results}).json()["issues"]
        payload = {
            "results": [
                {
                    "key": i["key"],
                    "summary": i["fields"]["summary"],
                    "status": i["fields"]["status"]["name"]
                }
                for i in issues
            ]
        }
        return json.dumps(payload)

    def _as_rich_text(self, text: str) -> Dict[str, Any]:
        return {
            "type": "doc", "version": 1,
            "content": [{"type": "paragraph", "content": [{"type": "text", "text": text}]}]
        }

    def _readable_desc(self, fields: Dict[str, Any]) -> str:
        try:
            blocks = fields["description"]["content"]
            return " ".join(t["text"] for b in blocks for t in b.get("content", []) if t["type"] == "text")
        except (KeyError, TypeError, AttributeError):
            return "No description."
        except Exception:
            raise

