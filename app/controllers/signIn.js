/*
 Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

angular.module('cognitoBlog.login', ['cognitoBlog.authService'])
    .controller('signInController', function($scope, $location, authService) {

    $scope.changeView = function(view){
        $location.path(view); // path not hash
    };

    //calling the signin method from AuthService to sign in the user to the application
    $scope.login = function(user, isValid) {

        if (isValid) {
            authService.signin(user).then(function(result) {
                console.log('Id Token: ' + result.getIdToken().getJwtToken());
                $location.path('/loggedIn');
            }, function(msg) {
                console.log(msg);
                if ($scope.$$phase != '$digest') {
                    $scope.$apply();
                }
                return;
            });
        } else {
            console.log("Probably you have provided invalid login fields");

        }
    };


});







