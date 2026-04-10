package test

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/eks"
	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
	"sigs.k8s.io/aws-iam-authenticator/pkg/token"

	//"github.com/gruntwork-io/terratest/modules/k8s"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"time"

	http_helper "github.com/gruntwork-io/terratest/modules/http-helper"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

func TestHelmDeployment(t *testing.T) {
	t.Parallel()
	helm_config := loadHelmConfig(t, "helm_data.json")

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(helm_config.Region),
	})

	eksClient := eks.New(sess)

	describeClusterInput := &eks.DescribeClusterInput{
		Name: aws.String(helm_config.ClusterName),
	}
	clusterDescription, err := eksClient.DescribeCluster(describeClusterInput)
	if err != nil {
		t.Fatal(err)
	}

	endpoint := *clusterDescription.Cluster.Endpoint
	cluster_ca_certificate := *clusterDescription.Cluster.CertificateAuthority.Data
	arn := *clusterDescription.Cluster.Arn
	certificateAuthorityData, err := base64.StdEncoding.DecodeString(cluster_ca_certificate)
	if err != nil {
		t.Fatal(err)
	}

	gen, err := token.NewGenerator(true, false)
	if err != nil {
		t.Fatal(err)
	}
	opts := &token.GetTokenOptions{
		ClusterID: helm_config.ClusterName,
	}
	tok, err := gen.GetWithOptions(opts)
	if err != nil {
		t.Fatal(err)
	}

	data := map[string]interface{}{
		"host":                   endpoint,
		"cluster_ca_certificate": cluster_ca_certificate,
		"token":                  tok.Token,
	}

	kubeconfig, err := json.Marshal(data)
	if err != nil {
		t.Fatal(err)
	}

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{

		TerraformDir: "../modules/helm-install",

		Vars: map[string]interface{}{
			"chart":            helm_config.Chart,
			"deploymentname":   helm_config.DeploymentName,
			"chartversion":     helm_config.ChartVersion,
			"values-files":     helm_config.ValuesFiles,
			"namespace":        helm_config.Namespace,
			"kubeconfig":       string(kubeconfig),
			"create_namespace": helm_config.CreateNamespace,
		},
	})

	terraform.InitAndApply(t, terraformOptions)

	defer terraform.Destroy(t, terraformOptions)

	output := terraform.Output(t, terraformOptions, "status")

	assert.Equal(t, "deployed", output)

	clusters := make(map[string]*clientcmdapi.Cluster)
	clusters[arn] = &clientcmdapi.Cluster{
		Server:                   endpoint,
		CertificateAuthorityData: []byte(certificateAuthorityData),
	}
	contexts := make(map[string]*clientcmdapi.Context)
	contexts[arn] = &clientcmdapi.Context{
		Cluster:  arn,
		AuthInfo: arn,
	}
	execinfos := &clientcmdapi.ExecConfig{
		APIVersion: "client.authentication.k8s.io/v1beta1",
		Command:    "aws",
		Args:       []string{"--region", helm_config.Region, "eks", "get-token", "--cluster-name", helm_config.ClusterName, "--output", "json"},
	}

	authinfos := make(map[string]*clientcmdapi.AuthInfo)
	authinfos[arn] = &clientcmdapi.AuthInfo{
		Exec: execinfos,
	}
	clientConfig := clientcmdapi.Config{
		Kind:           "Config",
		APIVersion:     "v1",
		Clusters:       clusters,
		Contexts:       contexts,
		CurrentContext: arn,
		AuthInfos:      authinfos,
	}
	currDir, err := os.Getwd()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	kubeConfigFile := filepath.Join(currDir, "kubeconfig")
	_ = clientcmd.WriteToFile(clientConfig, kubeConfigFile)
	defer os.Remove(kubeConfigFile)

	config, err := clientcmd.BuildConfigFromFlags("", kubeConfigFile)
	if err != nil {
		t.Fatal("Failed to build kubeconfig:", err)
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		t.Fatal("Failed to create Kubernetes client:", err)
	}

	namespace := helm_config.Namespace
	serviceName := "basic-image"
	service, err := clientset.CoreV1().Services(namespace).Get(context.TODO(), serviceName, metav1.GetOptions{})
	if err != nil {
		t.Fatal("Failed to get service:", err)
	}

	serviceOutput, err := json.Marshal(service.Status)
	if err != nil {
		t.Fatal("Failed to marshal service:", err)
	}
	fmt.Println(string(serviceOutput))
	url := fmt.Sprintf("http://%s", service.Status.LoadBalancer.Ingress[0].Hostname)
	http_helper.HttpGetWithRetry(t, url, nil, 200, "Congragulations! You have successfully deployed your first Node.js app on Kubernetes!", 30, 5*time.Second)
}

func loadHelmConfig(t *testing.T, path string) HelmConfig {
	var config HelmConfig
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

type HelmConfig struct {
	Region          string   `json:"region"`
	ClusterName     string   `json:"cluster_name"`
	Chart           string   `json:"chart"`
	DeploymentName  string   `json:"deploymentname"`
	ChartVersion    string   `json:"chartversion"`
	ValuesFiles     []string `json:"values-files"`
	Namespace       string   `json:"namespace"`
	CreateNamespace bool     `json:"create_namespace"`
}
