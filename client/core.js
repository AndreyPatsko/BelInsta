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


.service('currentUser',function(){

    var _currentUser;
    return {
        setName: function(name){
            _currentUser = name;
        },
        getName: function(){
            return _currentUser;
        }
    }

})

.controller('registrationCtrl',function($http,$scope, $location){

    $scope.registrate = function(user){
       
        $http.post('/registration',user)
           .success(function(){
               $location.path('/login');
           })
           
    }
})
.controller('loginCtrl',function($http,$scope, $location,currentUser){
    $scope.login = function(user){
        $http.post('/login',user)
            .success(function(){
                currentUser.setName($scope.user.username);
                $location.path('/home');
            })
    }
    
})

.controller('MyCtrl',  function ($http,$scope , Upload, $timeout,currentUser) {
    
    $http.post('/getCurrentUserImages')  
        .success(function(data){
            $scope.currentUserImages = data;
        })
    $http.post('/getCurrentUserProfile')
        .success(function(data){
            console.log(data)
            $scope.profile = data;
        })

    $http.post('/publicUsers')
        .success(function(data){
            $scope.publickUsers = data;
        })
    $scope.loadImages = function(user){
        $http.post('/loadImages',user)
            .success(function(data){
                user.images = data;
            })
    }

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
