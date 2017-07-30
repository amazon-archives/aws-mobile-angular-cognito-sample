/*
 Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
angular.module('cognitoBlog.register', ['cognitoBlog.authService'])
    .controller('registerController', function($scope, $location, authService) {

    $scope.errormessage="";


    //calling the signup method from AuthService to register a user
    $scope.register = function(newuser, isValid) {
        console.log(newuser);

        if (isValid) {

            authService.signup(newuser).then(function() {

                $location.path('/confirm');
            }, function(msg) {
                $scope.errormessage = "An unexpected error has occurred. Please try again.";

                $scope.$apply();
                return;
            });

        } else {
            $scope.errormessage = "There are still invalid fields.";

            $scope.$apply();
        }
    }

});


