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
    .when('/home/publicUsers',{
        templateUrl:'./templates/publickUsers.html',
        controller:'usersCtrl'
    })
    .otherwise({redirectTo: '/login'});
    $locationProvider.html5Mode(true);
})


.service('currentUser',function(){

    var _currentUser = {};
    return {
        setName: function(name){
            _currentUser.name = name;
        },
        getName: function(){
            return _currentUser.name;
        },
        setRole: function(isAdmin){
            _currentUser.isAdmin = isAdmin;
        },
        getRole: function(){
            return _currentUser.isAdmin;
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

.controller('MyCtrl',  function ($http,$scope ,$location, Upload, $timeout,currentUser) {

    $scope.currentUser = currentUser.getName();
    $scope.isAdmin = currentUser.getRole;
    // $scope.currentUser.isAdmin = currentUser.getRole();
    
    $http.post('/getCurrentUserImages')  
        .success(function(data){
            $scope.currentUserImages = data;
        })
    $http.post('/getCurrentUserProfile')
        .success(function(data){
            currentUser.setRole(data.isAdmin);
            $scope.profile = data.profile;
        })

    

    $scope.showAllPublicUsers = function(){
        $location.path('/home/publicUsers');
    }
    
    $scope.setVisibleImages = function(){
        var images = angular.element(document.querySelector(".ulImages"));
        images.css('display','inline-block')
    }    
    
    $scope.changeProfile = function(){
        $http.post('/updateUser',{profile:$scope.profile})
            .success(function(){
                console.log('ok')
                
            })
    }

    $scope.deleteImage = function($index){
        $http.delete('/home/image/'+$scope.currentUserImages[$index].id)
            .success(function(){
                 $scope.currentUserImages.splice($index,1)
            })
    }
    
    
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
                    $scope.currentUserImages.push({url:response.data.url,public_id:response.data.public_id});
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


.controller('usersCtrl',  function ($http,$scope , $location, Upload, $timeout,currentUser) {
    $scope.isAdmin = currentUser.getRole();
$http.post('/publicUsers')
        .success(function(data){
            $scope.publickUsers = data;
        })

$scope.loadImages = function(user){
        $http.post('/loadImages',user)
            .success(function(data){
                user.images = data;
                console.log(user.images)
            })
    }

    $scope.deleteImage = function(pict){
        console.log(pict.id)
        // $http.delete('/home/image/'+pict.id)
        //     .success(function(){
        //          $scope.currentUserImages.splice($index,1)
        //     })
    }

    $scope.backToProfile = function(){
        $location.path('/home')
    }

})

.controller('logoutCtrl',function($http,$scope, $location){
   
        $http.post('/logout')
            .success(function(){
                $location.path('/login');
            })
    }
    
)
