locals {
  common_tags = {
    application = "flowsource-pdlc"
    terraform   = "true"
  }
  collection = lookup(var.collection, var.knowledge_base.collection_name)
}

data "aws_opensearchserverless_collection" "pdlc-kb-vectordb-collection" {
  name = var.knowledge_base.collection_name
}


resource "aws_bedrockagent_knowledge_base" "pdlc_knowledge_base" {
  name     = var.knowledge_base.knowledge_base_name
  role_arn = var.knowledge_base.knowledge_base_service_role
  knowledge_base_configuration {
    vector_knowledge_base_configuration {
      embedding_model_arn = var.knowledge_base.embedding_model_arn
    }
    type = "VECTOR"
  }
  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"
    opensearch_serverless_configuration {
      collection_arn    = data.aws_opensearchserverless_collection.pdlc-kb-vectordb-collection.arn
      vector_index_name = local.collection.vector_index_name
      field_mapping {
        vector_field   = local.collection.vector_field_name
        text_field     = local.collection.text_field_name
        metadata_field = local.collection.metadata_field_name
      }
    }
  }
}

resource "aws_bedrockagent_data_source" "pdlc_data_source" {
  for_each = var.knowledge_base.datasources
  knowledge_base_id = aws_bedrockagent_knowledge_base.pdlc_knowledge_base.id
  name              = each.value.datasource_name
  data_deletion_policy = "DELETE"
  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn = each.value.datasource_s3_bucket_arn
      inclusion_prefixes = each.value.inclusion_prefixes
    }
  }
}

resource "aws_bedrockagent_agent" "pdlc_bedrockagent" {
  agent_name                  = var.agent_name
  agent_resource_role_arn     = var.agent_role_arn
  idle_session_ttl_in_seconds = 500
  prepare_agent               = true
  foundation_model            = var.foundation_model
  description                 = var.agent_description
  instruction                 = var.agent_instruction
  depends_on = [aws_bedrockagent_data_source.pdlc_data_source]
}

# Adding 5 seconds wait for the agent to be prepared before creating the alias 
resource "time_sleep" "wait_5_seconds" {
  depends_on = [aws_bedrockagent_agent.pdlc_bedrockagent]

  create_duration = "10s"
}

resource "aws_bedrockagent_agent_knowledge_base_association" "pdlc_bedrockagent_agent_kb_association" {
  agent_id             = aws_bedrockagent_agent.pdlc_bedrockagent.id
  description          = "bedrockagent Knowledge base association"
  knowledge_base_id    = aws_bedrockagent_knowledge_base.pdlc_knowledge_base.id
  knowledge_base_state = "ENABLED"

  depends_on = [time_sleep.wait_5_seconds]
}


# Adding 10 seconds wait for the agent to be prepared before associating with knowledge base
resource "time_sleep" "wait_10_seconds" {
  depends_on = [aws_bedrockagent_agent_knowledge_base_association.pdlc_bedrockagent_agent_kb_association]

  create_duration = "10s"
}

resource "aws_bedrockagent_agent_alias" "pdlc_bedrockagent_alias" {
  agent_alias_name = "${var.agent_name}-alias"
  agent_id         = aws_bedrockagent_agent.pdlc_bedrockagent.agent_id
  description      = var.alias_description
   depends_on = [time_sleep.wait_10_seconds]
}