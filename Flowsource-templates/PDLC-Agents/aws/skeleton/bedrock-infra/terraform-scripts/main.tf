module "opensearch-collections" {
  source    = "./module/opensearch-collections"
  for_each        = var.opensearch_collections

  collection_name = each.value.collection_name
  vpc_endpoint_id = each.value.vpc_endpoint_id
  knowledge_base_service_role = each.value.knowledge_base_service_role

}

module "opensearch-index-ipymterror" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["ipymterror-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["ipymterror-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["ipymterror-collection"].vector_field_name
  text_field_name = var.opensearch_collections["ipymterror-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["ipymterror-collection"].metadata_field_name
}

module "opensearch-index-user-story" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["user-story-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["user-story-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["user-story-collection"].vector_field_name
  text_field_name = var.opensearch_collections["user-story-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["user-story-collection"].metadata_field_name
}

module "opensearch-index-stakeholders-info" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["stakeholders-info-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["stakeholders-info-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["stakeholders-info-collection"].vector_field_name
  text_field_name = var.opensearch_collections["stakeholders-info-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["stakeholders-info-collection"].metadata_field_name
}

module "opensearch-index-deployment-checklist" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["deployment-checklist-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["deployment-checklist-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["deployment-checklist-collection"].vector_field_name
  text_field_name = var.opensearch_collections["deployment-checklist-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["deployment-checklist-collection"].metadata_field_name
}

module "opensearch-index-project-roadmap" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["project-roadmap-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["project-roadmap-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["project-roadmap-collection"].vector_field_name
  text_field_name = var.opensearch_collections["project-roadmap-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["project-roadmap-collection"].metadata_field_name
}

module "opensearch-index-kb-article" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["kb-article-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["kb-article-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["kb-article-collection"].vector_field_name
  text_field_name = var.opensearch_collections["kb-article-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["kb-article-collection"].metadata_field_name
}

module "opensearch-index-testcase-creation" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["testcase-creation-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["testcase-creation-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["testcase-creation-collection"].vector_field_name
  text_field_name = var.opensearch_collections["testcase-creation-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["testcase-creation-collection"].metadata_field_name
}

module "opensearch-index-regulatory-compliance" {
  source    = "./module/opensearch-index"

  url = module.opensearch-collections["regulatory-compliance-collection"].collection_endpoint

  vector_index_name = var.opensearch_collections["regulatory-compliance-collection"].vector_index_name
  vector_field_name = var.opensearch_collections["regulatory-compliance-collection"].vector_field_name
  text_field_name = var.opensearch_collections["regulatory-compliance-collection"].text_field_name
  metadata_field_name = var.opensearch_collections["regulatory-compliance-collection"].metadata_field_name
}

# The opensearch index collections be active, adding the time interval of xx seconds so that 
# the next resource using this collection doesn't encounter any error (like Unauthorized )
resource "time_sleep" "wait_30_seconds" {
  create_duration = "30s"

  depends_on = [module.opensearch-index-ipymterror, 
                module.opensearch-index-user-story,
                module.opensearch-index-stakeholders-info,
                module.opensearch-index-deployment-checklist,
                module.opensearch-index-project-roadmap,
                module.opensearch-index-kb-article,
                module.opensearch-index-testcase-creation,
                module.opensearch-index-regulatory-compliance]
}

module "bedrock" {
  source    = "./module/bedrock"
  for_each  = var.flowsource_bedrock_agents

  agent_name        = each.value.agent_name
  agent_description = each.value.agent_description
  agent_instruction = each.value.agent_instruction
  alias_description = each.value.alias_description
  agent_role_arn    = each.value.agent_role_arn
  foundation_model  = each.value.foundation_model
  knowledge_base    = each.value.knowledge_base
  collection        = var.opensearch_collections

  depends_on = [time_sleep.wait_30_seconds]
}