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
    $scope.images = [];
    $scope.users = [];
    $scope.currentUser = currentUser.getName();
    $scope.publickUsers = [];
    $scope.currentUserImages = [];
    $scope.profile = getCurrentUserStatus();

 function getCurrentUserStatus(){
     for(var i = 0; i < $scope.users.length; i++){
         if($scope.users[i].username == $scope.currentUser){
             return $scope.user[i].private;
         }
     }
 }

 let getPublickUsers = function(){
         
        for(var i = 0; i < $scope.users.length; i++){
            let pic = [];
           if($scope.users[i].private === false){
                    for(var j = 0; j < $scope.images.length; j++){
                    
                            if( $scope.images[j].owner == $scope.users[i].id){
                                
                                pic.push($scope.images[j].url)
                            }
                    }
            $scope.publickUsers.push({username:$scope.users[i].username,url:pic,private:$scope.users[i].private})
           }
        }
 }

    let getCurrentUserImages = function(){

        for(var i = 0; i < $scope.users.length; i++){
           
            if($scope.users[i].username == $scope.currentUser){
                for(var j = 0; j < $scope.images.length; j++){
                    if($scope.users[i].id == $scope.images[j].owner){
                         $scope.currentUserImages.push($scope.images[j].url)
                    }
                }
            }
        }
    }
    

    $http.get('/users')
        .success(function(users){
            $scope.users = users;
           console.log(1)
        })


    $http.get('/images')
        .success(function(images){
            $scope.images = images
            console.log(2)
            // console.log($scope.currentUserImages);
            // console.log($scope.currentUser);
            console.log($scope.publickUsers);
            // console.log($scope.images)
            // console.log($scope.users)
        })   
        .then(function(){
            console.log(3)
            getPublickUsers();
            
        }) 
        .then(function(){
            console.log(4)
            getCurrentUserImages();
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
