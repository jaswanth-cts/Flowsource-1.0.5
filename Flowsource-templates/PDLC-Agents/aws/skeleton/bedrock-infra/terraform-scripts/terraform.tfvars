region = "${{values.awsRegion}}"

opensearch_collections = {
    ipymterror-collection = {
        collection_name             = "ipymterror-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    user-story-collection = {
        collection_name             = "user-story-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    stakeholders-info-collection = {
        collection_name             = "stakeholders-info-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    deployment-checklist-collection = {
        collection_name             = "deployment-checklist-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    project-roadmap-collection = {
        collection_name             = "project-roadmap-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    kb-article-collection = {
        collection_name             = "kb-article-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    testcase-creation-collection = {
        collection_name             = "testcase-creation-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    },
    regulatory-compliance-collection = {
        collection_name             = "regulatory-compliance-collection"
        vpc_endpoint_id             = ["${{values.vpcEndpointId}}"]
        vector_index_name           = "bedrock-knowledge-base-default-index"
        vector_field_name           = "bedrock-knowledge-base-default-vector"
        text_field_name             = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field_name         = "AMAZON_BEDROCK_METADATA"
        knowledge_base_service_role = "${{values.bedrockRole}}"
    }
}

flowsource_bedrock_agents = {
    agent-iPYMTError = {
        agent_name          = "agent-iPYMTError"
        agent_description   = "This is to test the description for agent-iPYMTError of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for agent-iPYMTError of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.pymtErrorAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-ipymt"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.pymtErrorknowledgeBaseModel}}"
            collection_name             = "ipymterror-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "kb-ipymt-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["ipymt_error.md"]
                }
            }
        }
    },
    agent-user-story = {
        agent_name          = "agent-user-story"
        agent_description   = "This is to test the description for agent-user-story of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for agent-user-story of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.userStoryAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-userstory-test"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.userStoryKnowledgeBaseModel}}"
            collection_name             = "user-story-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "kb-userstory-test-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["User_Story/"]
                }
            }
        }
    },
    agent-stakeholders-info = {
        agent_name          = "agent-stakeholders-info"
        agent_description   = "This is to test the description for agent-stakeholders-info of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for agent-stakeholders-info of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.stakeholderInfoAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-stakeholder-detail"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.stakeholderInfoKnowledgeBaseModel}}"
            collection_name             = "stakeholders-info-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "knowledge-base-stakeholder-detail-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["Stakeholder_Details/"]
                }
            }
        }
    },
    agent-deployment-checklist = {
        agent_name          = "agent-deployment-checklist"
        agent_description   = "This is to test the description for agent-deployment-checklist of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for agent-deployment-checklist of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.deploymentChecklistAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-deployment-checklist"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.deploymentChecklistKnowledgeBaseModel}}"
            collection_name             = "deployment-checklist-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "knowledge-base-deployment-checklist-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["Deployment_Checklist/"]
                }
            }
        }
    },
    agent-project-roadmap = {
        agent_name          = "agent-project-roadmap"
        agent_description   = "This is to test the description for agent-project-roadmap of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for agent-project-roadmap of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.projectRoadmapAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-product-roadmap"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.projectRoadmapKnowledgeBaseModel}}"
            collection_name             = "project-roadmap-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "knowledge-base-product-roadmap-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["Project_Roadmap/"]
                }
            }
        }
    },
    Knowledge-base-article-agent = {
        agent_name          = "Knowledge-base-article-agent"
        agent_description   = "This is to test the description for Knowledge-base-article-agent of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for Knowledge-base-article-agent of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.knowledgeBaseArticleAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-text"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.knowledgeBaseArticleKnowledgeBaseModel}}"
            collection_name             = "kb-article-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "knowledge-base-text-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["KB_Text/"]
                }
            }
        }
    },
    testcase-creation-agent = {
        agent_name          = "testcase-creation-agent"
        agent_description   = "This is to test the description for testcase-creation-agent of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for testcase-creation-agent of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.testCaseCreationAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-test-case"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.testCaseCreationKnowledgeBaseModel}}"
            collection_name             = "testcase-creation-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "knowledge-base-test-case-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["Test_Case/"]
                }
            }
        }
    },
    Regulatory-Compliance-Agent = {
        agent_name          = "Regulatory-Compliance-Agent"
        agent_description   = "This is to test the description for Regulatory-Compliance-Agent of the bedrock "
        agent_instruction   = "Your goal is to provide clear and concise explanations"
        alias_description   = "This is to test the alias description for Regulatory-Compliance-Agent of the bedrock "
        agent_role_arn      = "${{values.bedrockRole}}"
        foundation_model    = "${{values.regulatoryComplianceAgentModel}}"
        knowledge_base = {
            knowledge_base_name         = "kb-regulatory-complaince"
            knowledge_base_service_role = "${{values.bedrockRole}}"
            embedding_model_arn         = "${{values.regulatoryComplianceKnowledgeBaseModel}}"
            collection_name             = "regulatory-compliance-collection"
            datasources = {
                kb-ipymt-data-source : {
                    datasource_name             = "knowledge-base-regulatory-complaince-data-source"
                    datasource_s3_bucket_arn    = "arn:aws:s3:::${{values.knowledgeBaseS3BucketName}}"
                    inclusion_prefixes          = ["Regulatory_Compliance/"]
                }
            }
        }
    }
}