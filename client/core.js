angular.module('app',['ngRoute','ngFileUpload'])

.config(function($routeProvider, $locationProvider){
    $routeProvider
    .when('/registration', {
        templateUrl:'./templates/registration.html',
        controller:'registrationCtrl'
    })
    .when('/login', {
        templateUrl:'./templates/login.html',
        controller:'loginCtrl'
    })
    .when('/logout', {
        templateUrl:'./templates/login.html',
        controller:'logoutCtrl'
    })
    .when('/home', {
        templateUrl:'./templates/home.html',
        controller:'MyCtrl'
    })
    .otherwise({redirectTo: '/login'});
    $locationProvider.html5Mode(true);
})

.controller('registrationCtrl',function($http,$scope, $location){

    $scope.registrate = function(user){
       
        $http.post('/registration',user)
           .success(function(){
               $location.path('/login');
           })
           
    }
})
.controller('loginCtrl',function($http,$scope, $location){
    $scope.login = function(user){
        $http.post('/login',user)
            .success(function(){
                $location.path('/home');
            })
    }
    
})

.controller('MyCtrl',  function ($http,$scope, Upload, $timeout) {
    $scope.images = [];
    $scope.profile = true;
    $scope.users = [];

    $scope.publickUsers = [];
    
      let getPublickUsers = function(){
         
        for(var i = 0; i < $scope.users.length; i++){
            let pic = [];
           
            for(var j = 0; j < $scope.images.length; j++){
             
            if(($scope.users[i].private == false) && ($scope.images[j].owner == $scope.users[i].id)){
                
                pic.push($scope.images[j].url)
              
            }
            }
            $scope.publickUsers.push({username:$scope.users[i].username,url:pic})
        }
    }

    $http.get('/users')
        .success(function(users){
            $scope.users = users;
           
        })
    $http.get('/images')
        .success(function(images){
            $scope.images = images;
            getPublickUsers();
            console.log($scope.publickUsers)
        })    
    
    

    $scope.$watch('profile',function(){
        // console.log($scope.profile)
        $http.post('/updateUser',{profile:$scope.profile})
            .success(function(){
                console.log('ok')
            })
    })
    
    
    $scope.uploadFiles = function(files, errFiles) {
        $scope.files = files;
        $scope.errFiles = errFiles;
        angular.forEach(files, function(file) {
            file.upload = Upload.upload({
                url: '/upload',
                data: {image: file}
            });
            
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    $scope.images.push({url:response.data});
                    // console.log($scope.images);
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * 
                                         evt.loaded / evt.total));
            });
        });
    }
  

    
})

.controller('logoutCtrl',function($http,$scope, $location){
   
        $http.post('/logout')
            .success(function(){
                $location.path('/login');
            })
    }
    
)
