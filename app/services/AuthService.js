
/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

angular.module('cognitoBlog.authService', ['cognitoBlog.utils'])
    .service('authService', function($q, $_, $localstorage) {

        this.signup = function(newuser) {
            var deferred = $q.defer();

            newuser.username = newuser.email.replace("@", "_").replace(".", "_");

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

            var attributeList = [];

            var dataEmail = {
                Name: 'email',
                Value: newuser.email
            };

            var dataName = {
                Name: 'name',
                Value: newuser.name
            };

            var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
            var attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName);

            attributeList.push(attributeEmail);
            attributeList.push(attributeName);

            console.log("Submitting " + newuser.name);
            userPool.signUp(newuser.username, newuser.password, attributeList, null, function(err, result) {
                if (err) {
                    console.log(err);
                    deferred.reject(err.message);
                } else {
                    deferred.resolve(result.user);
                }
            });

            return deferred.promise;

        };

        this.confirm = function(newuser) {
            var deferred = $q.defer();

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: newuser.username,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
            cognitoUser.confirmRegistration(newuser.confirmCode, true, function(err, result) {
                if (err) {
                    console.log(err);
                    deferred.reject(err);
                }
                deferred.resolve();
            });

            return deferred.promise;
        };

        this.signin = function(user) {
            var deferred = $q.defer();

            var authenticationData = {
                Username: user.email,
                Password: user.password
            };

            var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(
                authenticationData);
            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: user.email,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

            try {
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function(result) {
                        console.log(cognitoUser)
                        //console.log('access token + ' + result.getIdToken().getJwtToken());
                        $localstorage.set('username', cognitoUser.getUsername());
                        deferred.resolve(result);
                    },

                    onFailure: function(err) {
                        deferred.reject(err);
                    }

                });
            } catch (e) {
                console.log(e);
                deferred.reject(e);
            }

            return deferred.promise;

        };

        this.isAuthenticated = function() {
            var deferred = $q.defer();
            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            try {
                if (cognitoUser != null) {
                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            deferred.resolve(false);
                        }

                        deferred.resolve(true);

                        console.log('session validity: ' + session.isValid());

                        console.log('session token: ' + session.getIdToken().getJwtToken());

                        var paramsCredentials = {
                            IdentityPoolId : IDENTITY_POOL_ID,
                            Logins : {}
                        };

                        //passing dynamically the user pool id along with some constants
                        paramsCredentials.Logins[YOUR_USER_POOL_ID_IDP] = session.getIdToken().getJwtToken();

                        AWS.config.region = 'eu-west-1';
                        AWS.config.credentials = new AWS.CognitoIdentityCredentials(paramsCredentials);

                        AWS.config.credentials.clearCachedId();
                        AWS.config.credentials.get(function(err){
                            if (!err) {
                                var id = AWS.config.credentials.identityId;
                                console.log('Cognito Identity ID '+ id);

                                // Instantiate aws sdk service objects now that the credentials have been updated
                                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

                                var params = {
                                    TableName: ddbTable,
                                    Item:{userid: id}
                                };

                                var paramsQuery = {
                                    TableName : ddbTable,
                                    KeyConditionExpression: "userid = :id",
                                    ExpressionAttributeValues: {
                                        ":id":id
                                    }
                                };

                                //Query the table to identify if the user is in the table already. If the user is not in the table add his Cognito id as the hash key
                                docClient.query(paramsQuery, function(err, data) {
                                    if (err) {
                                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                                    } else {
                                        console.log("Query succeeded.");
                                        if( data.Items.length == 0) {
                                            console.log("User first time sign in - adding to table.");
                                            docClient.put(params, function (err, data) {
                                                if (err) console.log(err);
                                                else console.log(data);
                                            });
                                        }else{
                                            console.log("User exists in the table already.");
                                        }

                                    }
                                });



                            }
                        });
                    });
                } else {
                    deferred.resolve(false);
                }
            } catch (e) {
                console.log(e);
                deferred.resolve(false);
            }

            return deferred.promise;

        };

        this.updateItemDynamo = function(status) {
            var deferred = $q.defer();
            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();


            try {
                if (cognitoUser != null) {
                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            deferred.resolve(false);
                        }

                        deferred.resolve(true);

                        console.log('session validity: ' + session.isValid());

                        console.log('session token: ' + session.getIdToken().getJwtToken());

                        var paramsCredentials = {
                            IdentityPoolId : IDENTITY_POOL_ID,
                            Logins : {}
                        };

                        //passing dynamically the user pool id along with some constants
                        paramsCredentials.Logins[YOUR_USER_POOL_ID_IDP] = session.getIdToken().getJwtToken();

                        AWS.config.region = 'eu-west-1';
                        AWS.config.credentials = new AWS.CognitoIdentityCredentials(paramsCredentials);


                        AWS.config.credentials.get(function(err){

                            if (!err) {
                                var id = AWS.config.credentials.identityId;
                                console.log('Cognito Identity ID '+ id);

                                // Instantiate aws sdk service objects now that the credentials have been updated
                                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
                                //var ddbTable = 'CognitoBlog';

                                var params = {
                                    TableName: ddbTable,
                                    Item:{userid:id, status:status}
                                };

                                docClient.put(params, function(err, data) {
                                    if (err) console.log(err);
                                    else console.log(data);
                                });
                            }
                        });
                    });
                } else {
                    deferred.resolve(false);
                }
            } catch (e) {
                console.log(e);
                deferred.resolve(false);
            }

            return deferred.promise;

        };


        this.scanDynamoDB = function() {
            var deferred = $q.defer();
            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            try {
                if (cognitoUser != null) {
                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            deferred.resolve(false);
                        }

                        deferred.resolve(true);

                        console.log('session validity: ' + session.isValid());

                        console.log('session token: ' + session.getIdToken().getJwtToken());

                        var paramsCredentials = {
                            IdentityPoolId : IDENTITY_POOL_ID,
                            Logins : {}
                        };

                        //passing dynamically the user pool id along with some constants
                        paramsCredentials.Logins[YOUR_USER_POOL_ID_IDP] = session.getIdToken().getJwtToken();

                        AWS.config.region = 'eu-west-1';
                        AWS.config.credentials = new AWS.CognitoIdentityCredentials(paramsCredentials);

                        AWS.config.credentials.get(function(err){
                            if (!err) {

                                // Instantiate aws sdk service objects now that the credentials have been updated
                                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

                                var params = {
                                    TableName: ddbTable
                                };

                                docClient.scan(params, function(err, data) {
                                    if (err) console.log(err);
                                    else console.log(data);
                                });

                            }
                        });




                    });
                } else {
                    deferred.resolve(false);
                }
            } catch (e) {
                console.log(e);
                deferred.resolve(false);
            }

            return deferred.promise;

        };

        this.logOut = function() {

            try {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };
                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.signOut();
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                console.log(e);
                return false;
            }

        };

        this.getUserAccessToken = function() {
            var deferred = $q.defer();

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {

                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    deferred.resolve(session.idToken);
                });

            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        this.getUserAccessTokenWithUsername = function() {
            var deferred = $q.defer();

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {

                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }
                    deferred.resolve({
                        token: session.idToken,
                        username: cognitoUser.username
                    });
                });

            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        this.getUserInfo = function() {
            var deferred = $q.defer();

            var userinfo = {
                email: "",
                name: "",
                username: ""
            };
            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {

                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                    }

                    cognitoUser.getUserAttributes(function(err, result) {
                        if (err) {
                            console.log(err);
                            deferred.reject(err);
                        }

                        var nm = $_.where(result, {
                            Name: "name"
                        });
                        if (nm.length > 0) {
                            userinfo.name = nm[0].Value;
                        }

                        var em = $_.where(result, {
                            Name: "email"
                        });
                        if (em.length > 0) {
                            userinfo.email = em[0].Value;
                        }

                        userinfo.username = cognitoUser.getUsername();

                        deferred.resolve(userinfo);

                    });
                });
            } else {
                deferred.reject();
            }

            return deferred.promise;

        }
});

