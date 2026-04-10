provider "opensearch" {
  url = var.url
  healthcheck = false
}

# As the opensearch serverless collections takes time to apply policies and be active, adding the time interval of 30 seconds so that 
# the next resource using this collection doesn't encounter any error (like Unauthorized )
resource "time_sleep" "wait_120_seconds" {
  create_duration = "180s"
}

resource "opensearch_index" "index" {
    name = var.vector_index_name
    number_of_shards   = "1"
    number_of_replicas = "1"
    force_destroy = true
    index_knn                      = true
    index_knn_algo_param_ef_search = "512"

    mappings = jsonencode({
        "properties": {
            "${var.vector_field_name}": {
            "type": "knn_vector",
            "dimension": 1024,
            "method": {
                "name": "hnsw",
                "engine": "faiss",
                "parameters": {
                "m": 16,
                "ef_construction": 512
                },
                "space_type": "l2"
            }
        },
        "${var.metadata_field_name}": {
          "type": "text",
          "index": "false"
        },
        "${var.text_field_name}": {
          "type": "text",
          "index": "true"
        },
        "AMAZON_BEDROCK_TEXT_CHUNK": {
          "type": "text",
          "index": "true"
        }
    }
  })

  depends_on = [time_sleep.wait_120_seconds]
}