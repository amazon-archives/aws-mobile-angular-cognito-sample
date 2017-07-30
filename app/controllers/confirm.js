/*
 Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
angular.module('cognitoBlog.confirm', ['cognitoBlog.authService'])
    .controller('confirmController', function($scope, $location, authService) {

        //calling the confirm method from AuthService in order to confirm the user
        $scope.confirmAccount = function(newuser, isValid) {
            console.log(newuser);
            if (isValid) {
                newuser.username = newuser.email.replace("@", "_").replace(".", "_");
                console.log("Confirmation code " + newuser.confirmCode);

                authService.confirm(newuser).then(function(){
                    $location.path('/');
                }, function(msg) {
                    $scope.errormessage = "An unexpected error has occurred. Please try again.";
                    $scope.$apply();
                    return;
                });

            } else {
                $scope.errormessage = "There are still invalid fields.";
                $scope.$apply();
            }
        };
    });