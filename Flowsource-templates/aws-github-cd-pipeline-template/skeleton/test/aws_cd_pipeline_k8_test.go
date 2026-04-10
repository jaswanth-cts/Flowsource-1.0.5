package test

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/eks"
	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
)

func TestEksClusterCreation(t *testing.T) {
	t.Parallel()

	eks_config := loadEKSConfig(t, "eks_data.json")

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{

		TerraformDir: "../modules/eks",

		Vars: map[string]interface{}{
			"cluster-name":                    eks_config.ClusterName,
			"cluster-version":                 eks_config.ClusterVersion,
			"eks_subnet_ids":                  eks_config.EksSubnetIds,
			"vpc_id":                          eks_config.VpcId,
			"instance-types":                  eks_config.InstanceTypes,
			"eks-min-instances":               eks_config.EksMinInstances,
			"eks-max-instances":               eks_config.EksMaxInstances,
			"create_iam_role":                 eks_config.CreateIamRole,
			"cluster_iam_role":                eks_config.ClusterIamRole,
			"node_iam_role":                   eks_config.NodeIamRole,
			"cluster_endpoint_public_access":  eks_config.ClusterEndpointPrivateAccess,
			"cluster_endpoint_private_access": eks_config.ClusterEndpointPrivateAccess,
			"bastion-cidr":                    eks_config.BastionCidr,
			"bastion-sg-id":                   eks_config.BastionSgId,
			"cluster_security_group_name":     eks_config.ClusterSecurityGroupName,
		},
	})

	defer terraform.Destroy(t, terraformOptions)

	terraform.InitAndApply(t, terraformOptions)

	cluster_status := terraform.Output(t, terraformOptions, "cluster_status")
	cluster_version := terraform.Output(t, terraformOptions, "cluster_version")

	assert.Equal(t, "ACTIVE", cluster_status)
	assert.Equal(t, "1.31", cluster_version)

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(eks_config.Region),
	})
	if err != nil {
		t.Fatal(err)
	}
	eksClient := eks.New(sess)

	nodegroupsInput := &eks.ListNodegroupsInput{
		ClusterName: aws.String(eks_config.ClusterName),
	}

	nodegroupsOutput, err := eksClient.ListNodegroups(nodegroupsInput)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, 1, len(nodegroupsOutput.Nodegroups))

}

func loadEKSConfig(t *testing.T, path string) EKSConfig {
	var config EKSConfig
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("Failed to read config file: %v", err)
	}
	err = json.Unmarshal(data, &config)
	if err != nil {
		t.Fatalf("Failed to unmarshal config file: %v", err)
	}
	return config
}

type EKSConfig struct {
	Region                       string   `json:"region"`
	ClusterName                  string   `json:"cluster_name"`
	ClusterVersion               string   `json:"cluster_version"`
	EksSubnetIds                 []string `json:"eks_subnet_ids"`
	VpcId                        string   `json:"vpc_id"`
	InstanceTypes                []string `json:"instance_types"`
	EksMinInstances              int      `json:"eks_min_instances"`
	EksMaxInstances              int      `json:"eks_max_instances"`
	CreateIamRole                bool     `json:"create_iam_role"`
	ClusterIamRole               string   `json:"cluster_iam_role"`
	NodeIamRole                  string   `json:"node_iam_role"`
	ClusterEndpointPublicAccess  bool     `json:"cluster_endpoint_public_access"`
	ClusterEndpointPrivateAccess bool     `json:"cluster_endpoint_private_access"`
	BastionCidr                  string   `json:"bastion_cidr"`
	BastionSgId                  string   `json:"bastion_sg_id"`
	ClusterSecurityGroupName     string   `json:"cluster_security_group_name"`
}
