/*
 Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
angular.module('cognitoBlog.loggedIn', ['cognitoBlog.authService'])
    .controller('loggedInController', function($scope, $location, authService) {


        //calling the isAuthenticated method from AuthService in order to add the user to DynamoDB table if not exists already
        if (true) {
                authService.isAuthenticated().then(function(result) {
                    console.log(result);

                }, function(msg) {
                    console.log(msg);
                    $scope.errormessage = "Unable to access DynamoDB";

                    if ($scope.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    return;
                });
            } else {
                $scope.errormessage = "Some error happened";

            };


        $scope.status="";

        //calling the updateItemDynamo method from AuthService in order to update the Status attribute for a given user
        $scope.replaceDynamoDBItem = function(isValid, status) {

            if (isValid) {
                authService.updateItemDynamo(status).then(function(result) {
                    console.log(result);
                }, function(msg) {
                    console.log(msg);
                    $scope.errormessage = "Unable to access DynamoDB";

                    if ($scope.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    return;
                });
            } else {
                $scope.errormessage = "Some error happened";

            }
        };

        //calling the scanDynamoDB method from the AuthService in order to scan the Dynamo DB items
        $scope.scanDynamoDBItems = function(isValid) {

            if (isValid) {

                authService.scanDynamoDB().then(function(result) {
                    console.log(result);

                }, function(msg) {
                    console.log(msg);
                    $scope.errormessage = "Unable to access DynamoDB";

                    if ($scope.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    return;
                });
            } else {
                $scope.errormessage = "Some error happened";

            }
        };

        $scope.logout = function() {
            authService.logOut();
            $location.path('/');
        }


    });


