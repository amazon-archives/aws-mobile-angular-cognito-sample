# Building fine-grained authorization using Amazon Cognito User Pools groups

**This Angular.js application** is a reference web app that allows users to explore the use of groups in Amazon Cognito User Pools, together with Amazon Cognito Federated Identities identity pools, to obtain temporary IAM credentials in your web app.
The IAM credentials map to privileges that a user obtains after successfully authenticating with a user pool. Those privileges are determined by the role that is mapped to the user pool group that the user belongs to.
User pools provide flexibility. You can use them to implement granular authorization architectures for authenticated users.
The project code is released under the Apache 2.0 license.
Please feel free to make use of the code in this project, and spread the word.
We hope you enjoy it, and we certainly welcome all feedback, pull requests and other contributions!


## Architecture diagram
![Amazon Cognito Authentication flow](https://d2908q01vomqb2.cloudfront.net/0a57cb53ba59c46fc4b692527a38a87c78d84028/2017/07/19/CognitoDiagram.png)

## AWS services used

This sample is built using the following AWS services:

* [AWS Cognito](https://aws.amazon.com/cognito/) - Amazon Cognito lets you easily add user sign-up and sign-in to your mobile and web apps. With Amazon Cognito, you also have the options to authenticate users through social identity providers such as Facebook, Twitter, or Amazon, with SAML identity solutions, or by using your own identity system. Furthermore, AWS Cognito supports User Groups that let to create collections of users to manage their permissions or to represent different types of users.
* [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) - Amazon DynamoDB is a fast and flexible NoSQL database service for all applications that need consistent, single-digit millisecond latency at any scale. It is a fully managed cloud database and supports both document and key-value store models.

## Get started

#### Instructions to install dependencies and populate constants

* Run `bower install` from the root of your directory once you clone this project.
* Navigate to `lib/aws-variables.js` and populate your own details. More detailed instructions can be found in the [Building fine-grained authorization using Amazon Cognito User Pools groups](https://aws.amazon.com/blogs/mobile/building-fine-grained-authorization-using-amazon-cognito-user-pools-groups/) blog.
