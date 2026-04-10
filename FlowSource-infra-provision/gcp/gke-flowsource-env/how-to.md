- Ensure assignment to the SAs for GKE & Bastion Host (Refer "roles.md" file)
- Run on Local
	- Create backend bucket
		Scripts placed inside - pre-requisites/backend
	- Create Google Artifact Repository 
		Scripts placed inside - pre-requisites/gar
	- Create Network
		Scripts placed inside - pre-requisites/network
	- Create Private Pool
		Scripts placed inside - pre-requisites/private-pool	
	- Create Bastion
		Scripts placed inside - pre-requisites/bastion
	- Create AlloyDB 
		Scripts placed inside - alloydb
	- Create  GKE Cluster
		Scripts placed inside - gke

- Run on Bastion
	- Login to Bastion Host
		- Configure login
		- Set Project
		- Get container credentials
		- Clone repo with gcp-csi-driver -- apply terraform
		- Clone repo with App (flowsource/sample/etc) -- apply terraform 
		- Clone repo with authui -- apply terraform