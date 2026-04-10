
resource "aws_opensearchserverless_security_policy" "pdlc-encryption-policy" {
  name = "${var.collection_name}"
  type = "encryption"
  policy = jsonencode({
    "Rules" = [
      {
        "Resource" = [
          "collection/${var.collection_name}"
        ],
        "ResourceType" = "collection"
      }
    ],
    AWSOwnedKey = true
  })
}

resource "aws_opensearchserverless_security_policy" "network-policy" {
  name = "${var.collection_name}"
  type = "network"
  policy = jsonencode([{
    "Rules" = [
      {
        "Resource": [
          "collection/${var.collection_name}"
        ],
        "ResourceType": "dashboard"
      },
      {
        "Resource" = [
          "collection/${var.collection_name}"
        ],
        "ResourceType" = "collection"
      }
    ],
    AllowFromPublic = false
    SourceVPCEs = var.vpc_endpoint_id,
    "SourceServices": ["bedrock.amazonaws.com"]
  }])
}

data "aws_caller_identity" "current" {}

resource "aws_opensearchserverless_access_policy" "data-acess-policy" {
  name        = "${var.collection_name}"
  type        = "data"
  description = "read and write permissions"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection",
          Resource = [
            "collection/${var.collection_name}"
          ],
          Permission = [
            "aoss:CreateCollectionItems",
            "aoss:DeleteCollectionItems",
            "aoss:UpdateCollectionItems",
            "aoss:DescribeCollectionItems"
          ]
        },
        {
          ResourceType = "index",
          Resource = [
            "index/${var.collection_name}/*"
          ],
          Permission = [
            "aoss:CreateIndex",
            "aoss:DeleteIndex",
            "aoss:UpdateIndex",
            "aoss:DescribeIndex",
            "aoss:ReadDocument",
            "aoss:WriteDocument"
          ]
        }
      ],
      Principal = [
        "${data.aws_caller_identity.current.arn}",
        "${var.knowledge_base_service_role}"
      ]
    }
  ])
}

resource "aws_opensearchserverless_collection" "pdlc-kb-vectordb-collection" {
  name = var.collection_name
  type = "VECTORSEARCH"

  depends_on = [aws_opensearchserverless_security_policy.pdlc-encryption-policy,
                aws_opensearchserverless_security_policy.network-policy,
                aws_opensearchserverless_access_policy.data-acess-policy]
}
